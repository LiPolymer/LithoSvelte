<script lang="ts">
  import { onDestroy, tick, type Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { setDialogContext } from './dialogContext'
  import IconButton from './IconButton.svelte'
  import Overlay from './internal/overlay/Overlay.svelte'
  import type { OverlayDismissDetails } from './internal/overlay/overlayStack'

  export type DialogSize = 'compact' | 'default' | 'wide'
  export type DialogInitialFocus = 'first' | 'surface'
  export type DialogRole = 'dialog' | 'alertdialog'
  export type DialogOpenChangeReason =
    | 'trigger'
    | 'escape'
    | 'outside-pointer'
    | 'close-button'
    | 'close-action'

  export type DialogOpenChangeDetails = {
    reason: DialogOpenChangeReason
    originalEvent?: Event
  }

  type DialogKeyboardEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLDivElement
  }

  export type DialogProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    | 'aria-describedby'
    | 'aria-labelledby'
    | 'children'
    | 'class'
    | 'id'
    | 'onkeydown'
    | 'role'
    | 'title'
  > & {
    title: Snippet
    trigger?: Snippet
    description?: Snippet
    children?: Snippet
    actions?: Snippet
    open?: boolean
    size?: DialogSize
    initialFocus?: DialogInitialFocus
    dismissOnEscape?: boolean
    dismissOnPointerOutside?: boolean
    restoreFocus?: boolean
    showClose?: boolean
    closeLabel?: string
    role?: DialogRole
    id?: string
    class?: string
    onopenchange?: (
      open: boolean,
      details: DialogOpenChangeDetails,
    ) => void
    onkeydown?: HTMLAttributes<HTMLDivElement>['onkeydown']
  }

  const TRIGGER_SELECTOR = [
    '[data-lds-dialog-trigger]',
    'button',
    'a[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]',
  ].join(',')

  const FOCUSABLE_SELECTOR = [
    'button:not(:disabled)',
    'a[href]',
    'input:not(:disabled)',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    '[contenteditable="true"]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',')

  let {
    title,
    trigger,
    description,
    children,
    actions,
    open = $bindable(false),
    size = 'default',
    initialFocus = 'first',
    dismissOnEscape = true,
    dismissOnPointerOutside = true,
    restoreFocus = true,
    showClose = true,
    closeLabel = 'Close dialog',
    role = 'dialog',
    id,
    class: className = '',
    onopenchange,
    onkeydown: userOnkeydown,
    ...attributes
  }: DialogProps = $props()

  const componentId = $props.id()
  let dialogId = $derived(id ?? `${componentId}-dialog`)
  let titleId = $derived(`${dialogId}-title`)
  let descriptionId = $derived(
    description ? `${dialogId}-description` : undefined,
  )
  let overlayElement = $state<HTMLDivElement>()
  let surfaceElement = $state<HTMLDivElement>()
  let triggerElement = $state<HTMLElement | null>(null)
  let revealed = $state(false)
  let settled = $state(false)
  let closing = $state(false)
  let needsInitialFocus = false
  let wasOpen = false
  let triggerAttributes:
    | Map<string, string | null>
    | undefined

  let present = $derived(open || closing)

  setDialogContext({
    close(originalEvent) {
      closeDialog({ reason: 'close-action', originalEvent })
    },
  })

  function resolveTrigger(
    target: EventTarget | null,
    anchor: HTMLSpanElement,
  ) {
    const closestTrigger =
      target instanceof Element
        ? target.closest<HTMLElement>(TRIGGER_SELECTOR)
        : null

    if (closestTrigger && anchor.contains(closestTrigger)) {
      return closestTrigger
    }

    return anchor.querySelector<HTMLElement>(TRIGGER_SELECTOR)
  }

  function restoreTriggerAttributes() {
    if (!triggerElement || !triggerAttributes) return

    for (const [name, value] of triggerAttributes) {
      if (value === null) {
        triggerElement.removeAttribute(name)
      } else {
        triggerElement.setAttribute(name, value)
      }
    }

    triggerAttributes = undefined
  }

  function setTriggerElement(nextTrigger: HTMLElement | null) {
    if (triggerElement === nextTrigger) return

    restoreTriggerAttributes()
    triggerElement = nextTrigger

    if (nextTrigger) {
      triggerAttributes = new Map(
        ['aria-controls', 'aria-expanded', 'aria-haspopup'].map((name) => [
          name,
          nextTrigger.getAttribute(name),
        ]),
      )
    }

    syncTriggerAttributes()
  }

  function syncTriggerAttributes() {
    if (!triggerElement) return

    triggerElement.setAttribute('aria-haspopup', 'dialog')
    triggerElement.setAttribute('aria-controls', dialogId)
    triggerElement.setAttribute('aria-expanded', String(open))
  }

  function triggerIsDisabled(trigger: HTMLElement) {
    return (
      trigger.matches(':disabled') ||
      trigger.getAttribute('aria-disabled') === 'true'
    )
  }

  function isFocusable(element: HTMLElement) {
    return (
      !element.hidden &&
      !element.closest('[inert]') &&
      element.getAttribute('aria-hidden') !== 'true' &&
      getComputedStyle(element).visibility !== 'hidden' &&
      element.getClientRects().length > 0
    )
  }

  function getFocusableElements() {
    if (!surfaceElement) return []

    return Array.from(
      surfaceElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter(isFocusable)
  }

  function focusInitialElement() {
    if (!surfaceElement) return

    if (initialFocus === 'surface') {
      surfaceElement.focus({ preventScroll: true })
      return
    }

    const explicitTarget = surfaceElement.querySelector<HTMLElement>(
      '[autofocus], [data-lds-dialog-initial-focus]',
    )
    const firstContentTarget = getFocusableElements().find(
      (element) => !element.hasAttribute('data-lds-dialog-close'),
    )

    ;(explicitTarget && isFocusable(explicitTarget)
      ? explicitTarget
      : firstContentTarget ?? surfaceElement
    ).focus({ preventScroll: true })
  }

  function openDialog(details: DialogOpenChangeDetails) {
    if (open) {
      focusInitialElement()
      return
    }

    closing = false
    revealed = false
    settled = false
    needsInitialFocus = true
    open = true
    onopenchange?.(true, details)
  }

  function closeDialog(details: DialogOpenChangeDetails) {
    if (!open && !closing) return

    const shouldNotify = open
    revealed = false
    settled = false
    needsInitialFocus = false
    open = false
    closing = true

    if (shouldNotify) onopenchange?.(false, details)
  }

  function completeClose() {
    if (open || !closing) return
    closing = false
  }

  function handleSurfaceTransitionend(event: TransitionEvent) {
    if (
      event.currentTarget !== event.target ||
      event.propertyName !== 'transform'
    ) return

    if (open && revealed) {
      settled = true
    } else if (!open) {
      completeClose()
    }
  }

  function handleOverlayOpenchange(
    nextOpen: boolean,
    details: OverlayDismissDetails,
  ) {
    if (nextOpen) return

    closeDialog({
      reason:
        details.reason === 'escape' ? 'escape' : 'outside-pointer',
      originalEvent: details.originalEvent,
    })
  }

  function handleDialogKeydown(event: DialogKeyboardEvent) {
    userOnkeydown?.(event)
    if (event.defaultPrevented || event.key !== 'Tab') return

    const focusable = getFocusableElements()
    const activeElement = document.activeElement

    if (focusable.length === 0) {
      event.preventDefault()
      surfaceElement?.focus({ preventScroll: true })
      return
    }

    const first = focusable[0]
    const last = focusable.at(-1)!

    if (
      event.shiftKey &&
      (activeElement === first || activeElement === surfaceElement)
    ) {
      event.preventDefault()
      last.focus({ preventScroll: true })
    } else if (
      !event.shiftKey &&
      (activeElement === last || !surfaceElement?.contains(activeElement))
    ) {
      event.preventDefault()
      first.focus({ preventScroll: true })
    }
  }

  function handleDocumentFocusin(event: FocusEvent) {
    if (!open || !surfaceElement || !overlayElement) return

    const target = event.target
    if (!(target instanceof HTMLElement) || surfaceElement.contains(target)) {
      return
    }

    const targetOverlay = target.closest<HTMLElement>('.lds-overlay')
    const ownOrder = Number(overlayElement.dataset.stackOrder ?? 0)
    const targetOrder = Number(targetOverlay?.dataset.stackOrder ?? 0)

    if (targetOverlay && targetOrder > ownOrder) return

    queueMicrotask(() => {
      if (open && surfaceElement && !surfaceElement.contains(document.activeElement)) {
        surfaceElement.focus({ preventScroll: true })
      }
    })
  }

  function dialogAnchor(anchor: HTMLSpanElement) {
    function updateTrigger() {
      setTriggerElement(resolveTrigger(null, anchor))
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return

      const target = resolveTrigger(event.target, anchor)
      if (!target || triggerIsDisabled(target)) return

      setTriggerElement(target)
      openDialog({ reason: 'trigger', originalEvent: event })
    }

    updateTrigger()
    const observer = new MutationObserver(updateTrigger)
    observer.observe(anchor, { childList: true, subtree: true })
    anchor.addEventListener('click', handleClick)

    return {
      destroy() {
        observer.disconnect()
        anchor.removeEventListener('click', handleClick)
        restoreTriggerAttributes()
        triggerElement = null
      },
    }
  }

  $effect(() => {
    dialogId
    syncTriggerAttributes()

    if (open) {
      const justOpened = !wasOpen
      closing = false
      wasOpen = true

      if (justOpened) {
        revealed = false
        settled = false
        needsInitialFocus = true
      }
    } else {
      revealed = false
      settled = false
      if (wasOpen && !closing) closing = true
      wasOpen = false
    }
  })

  $effect(() => {
    if (!open || !surfaceElement) {
      revealed = false
      return
    }

    let firstFrame: number | undefined
    let secondFrame: number | undefined

    function reveal() {
      if (!open || !surfaceElement) return

      revealed = true
      settled = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      if (needsInitialFocus) {
        needsInitialFocus = false
        void tick().then(() => {
          if (open) focusInitialElement()
        })
      }
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveal()
    } else {
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(reveal)
      })
    }

    return () => {
      if (firstFrame !== undefined) cancelAnimationFrame(firstFrame)
      if (secondFrame !== undefined) cancelAnimationFrame(secondFrame)
    }
  })

  $effect(() => {
    if (!closing || !surfaceElement) return

    let cancelled = false

    void tick().then(() => {
      if (cancelled || !closing || !surfaceElement) return

      const hasMotion = getComputedStyle(surfaceElement)
        .transitionDuration.split(',')
        .some((duration) => Number.parseFloat(duration) > 0)

      if (!hasMotion) queueMicrotask(completeClose)
    })

    return () => {
      cancelled = true
    }
  })

  $effect(() => {
    if (!open) return

    document.addEventListener('focusin', handleDocumentFocusin, true)

    return () => {
      document.removeEventListener('focusin', handleDocumentFocusin, true)
    }
  })

  onDestroy(restoreTriggerAttributes)
</script>

<span class="lds-dialog-anchor" use:dialogAnchor>
  {@render trigger?.()}

  <Overlay
    {open}
    {present}
    modal
    {dismissOnEscape}
    {dismissOnPointerOutside}
    {restoreFocus}
    bind:element={overlayElement}
    class="lds-dialog-overlay"
    data-revealed={revealed}
    data-settled={settled}
    onopenchange={handleOverlayOpenchange}
  >
    <div class="lds-dialog__backdrop" aria-hidden="true"></div>

    <div class="lds-dialog__positioner" role="presentation">
      <div
        {...attributes}
        bind:this={surfaceElement}
        id={dialogId}
        class={`lds-dialog lds-dialog--${size} ${className}`}
        {role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabindex="-1"
        data-lds-overlay-surface=""
        data-has-body={Boolean(children)}
        data-has-content={Boolean(children || actions)}
        onkeydown={handleDialogKeydown}
        ontransitionend={handleSurfaceTransitionend}
      >
        <header class="lds-dialog__header">
          <div class="lds-dialog__heading">
            <h2 id={titleId} class="lds-dialog__title">
              {@render title()}
            </h2>

            {#if description}
              <p id={descriptionId} class="lds-dialog__description">
                {@render description()}
              </p>
            {/if}
          </div>

          {#if showClose}
            <IconButton
              icon="close"
              label={closeLabel}
              data-lds-dialog-close=""
              onclick={(event) =>
                closeDialog({
                  reason: 'close-button',
                  originalEvent: event,
                })}
            />
          {/if}
        </header>

        {#if children || actions}
          <div
            class="lds-dialog__reveal"
            inert={!revealed}
            aria-hidden={!revealed}
          >
            <div class="lds-dialog__reveal-content">
              {#if children}
                <div class="lds-dialog__body">
                  {@render children()}
                </div>
              {/if}

              {#if actions}
                <footer class="lds-dialog__actions">
                  {@render actions()}
                </footer>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </Overlay>
</span>
