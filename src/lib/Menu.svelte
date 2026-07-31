<script lang="ts">
  import { onDestroy, tick, type Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import FloatingLayer from './internal/overlay/FloatingLayer.svelte'
  import Overlay from './internal/overlay/Overlay.svelte'
  import type {
    FloatingAlign,
    FloatingPlacement,
  } from './internal/overlay/floating'
  import type { OverlayDismissDetails } from './internal/overlay/overlayStack'
  import {
    setMenuContext,
    type MenuOpenChangeDetails,
    type MenuOpenChangeReason,
  } from './menuContext'

  type MenuKeyboardEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLDivElement
  }

  export type MenuProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    | 'aria-label'
    | 'children'
    | 'class'
    | 'id'
    | 'onkeydown'
    | 'role'
  > & {
    label: string
    trigger: Snippet
    children: Snippet
    open?: boolean
    placement?: FloatingPlacement
    align?: FloatingAlign
    gap?: number
    loop?: boolean
    id?: string
    class?: string
    onopenchange?: (
      open: boolean,
      details: MenuOpenChangeDetails,
    ) => void
    onkeydown?: HTMLAttributes<HTMLDivElement>['onkeydown']
  }

  const TRIGGER_SELECTOR = [
    '[data-lds-menu-trigger]',
    'button',
    'a[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]',
  ].join(',')
  const ITEM_SELECTOR = '[role^="menuitem"]:not(:disabled)'
  const DOCUMENT_TAB_STOP_SELECTOR = [
    'button:not(:disabled)',
    'a[href]',
    'input:not(:disabled)',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',')

  let {
    label,
    trigger,
    children,
    open = $bindable(false),
    placement = 'bottom',
    align = 'start',
    gap = 6,
    loop = true,
    id,
    class: className = '',
    onopenchange,
    onkeydown: userOnkeydown,
    ...attributes
  }: MenuProps = $props()

  let menuAttributes = $derived(
    attributes as HTMLAttributes<HTMLDivElement>,
  )
  const componentId = $props.id()
  let menuId = $derived(id ?? `${componentId}-menu`)
  let menuElement = $state<HTMLDivElement>()
  let surfaceElement = $state<HTMLDivElement>()
  let triggerElement = $state<HTMLElement | null>(null)
  let positioned = $state(false)
  let revealed = $state(false)
  let closing = $state(false)
  let needsInitialFocus = false
  let restoreFocusAfterClose = false
  let pendingInitialFocus: 'first' | 'last' = 'first'
  let wasOpen = false
  let typeaheadTimer: ReturnType<typeof setTimeout> | undefined
  let typeaheadQuery = ''
  let triggerAttributes:
    | Map<string, string | null>
    | undefined

  let present = $derived(open || closing)

  setMenuContext({
    close(details, restoreFocus = true) {
      closeMenu(details, restoreFocus)
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

    triggerElement.setAttribute('aria-haspopup', 'menu')
    triggerElement.setAttribute('aria-controls', menuId)
    triggerElement.setAttribute('aria-expanded', String(open))
  }

  function triggerIsDisabled(trigger: HTMLElement) {
    return (
      trigger.matches(':disabled') ||
      trigger.getAttribute('aria-disabled') === 'true'
    )
  }

  function getItems() {
    if (!menuElement) return []

    return Array.from(
      menuElement.querySelectorAll<HTMLButtonElement>(ITEM_SELECTOR),
    ).filter(
      (item) =>
        item.closest<HTMLElement>('[role="menu"]') === menuElement &&
        !item.hidden &&
        item.getAttribute('aria-hidden') !== 'true',
    )
  }

  function focusItemAt(index: number) {
    const items = getItems()
    if (items.length === 0) return

    const resolvedIndex = loop
      ? (index + items.length) % items.length
      : Math.min(Math.max(index, 0), items.length - 1)
    items[resolvedIndex]?.focus({ preventScroll: true })
  }

  function focusInitialItem(preference: 'first' | 'last') {
    const items = getItems()
    const item = preference === 'last' ? items.at(-1) : items[0]
    item?.focus({ preventScroll: true })
  }

  function openMenu(
    preference: 'first' | 'last',
    details: MenuOpenChangeDetails,
  ) {
    pendingInitialFocus = preference
    restoreFocusAfterClose = false
    closing = false

    if (open) {
      focusInitialItem(preference)
      return
    }

    positioned = false
    revealed = false
    needsInitialFocus = true
    open = true
    onopenchange?.(true, details)
  }

  function closeMenu(
    details: MenuOpenChangeDetails,
    restoreFocus = true,
  ) {
    if (!open && !closing) return

    const shouldNotify = open
    restoreFocusAfterClose = restoreFocus
    revealed = false
    needsInitialFocus = false
    open = false
    closing = true

    if (shouldNotify) onopenchange?.(false, details)

    if (restoreFocus) {
      queueMicrotask(() => {
        if (!open && restoreFocusAfterClose && triggerElement?.isConnected) {
          triggerElement.focus()
          restoreFocusAfterClose = false
        }
      })
    }
  }

  function completeClose() {
    if (open || !closing) return

    closing = false

    restoreFocusAfterClose = false
  }

  function handleSurfaceTransitionend(event: TransitionEvent) {
    if (
      event.currentTarget === event.target &&
      event.propertyName === 'transform' &&
      !open
    ) {
      completeClose()
    }
  }

  function handleOverlayOpenchange(
    nextOpen: boolean,
    details: OverlayDismissDetails,
  ) {
    if (nextOpen) return

    closeMenu(
      {
        reason:
          details.reason === 'escape' ? 'escape' : 'outside-pointer',
        originalEvent: details.originalEvent,
      },
      true,
    )
  }

  function getItemText(item: HTMLElement) {
    return (
      item.dataset.textValue ??
      item.textContent ??
      ''
    ).trim().toLocaleLowerCase()
  }

  function handleTypeahead(
    key: string,
    currentItem: HTMLButtonElement | null,
  ) {
    if (typeaheadTimer !== undefined) clearTimeout(typeaheadTimer)

    typeaheadQuery += key.toLocaleLowerCase()
    const items = getItems()
    const startIndex = currentItem ? items.indexOf(currentItem) : -1

    function findMatch(query: string) {
      for (let offset = 1; offset <= items.length; offset += 1) {
        const index = (startIndex + offset) % items.length
        if (getItemText(items[index]).startsWith(query)) return items[index]
      }
    }

    let match = findMatch(typeaheadQuery)

    if (!match && typeaheadQuery.length > 1) {
      typeaheadQuery = key.toLocaleLowerCase()
      match = findMatch(typeaheadQuery)
    }

    match?.focus({ preventScroll: true })

    typeaheadTimer = setTimeout(() => {
      typeaheadQuery = ''
      typeaheadTimer = undefined
    }, 500)
  }

  function focusAdjacentToTrigger(backwards: boolean) {
    if (!triggerElement) return

    const tabStops = Array.from(
      document.querySelectorAll<HTMLElement>(DOCUMENT_TAB_STOP_SELECTOR),
    ).filter(
      (element) =>
        !element.closest('.lds-overlay') &&
        !element.hidden &&
        element.getAttribute('aria-hidden') !== 'true' &&
        getComputedStyle(element).visibility !== 'hidden' &&
        element.getClientRects().length > 0,
    )
    const triggerIndex = tabStops.indexOf(triggerElement)
    const nextItem = tabStops[triggerIndex + (backwards ? -1 : 1)]

    queueMicrotask(() => {
      if (nextItem) {
        nextItem.focus()
      } else {
        triggerElement?.blur()
      }
    })
  }

  function handleMenuKeydown(event: MenuKeyboardEvent) {
    userOnkeydown?.(event)
    if (event.defaultPrevented) return

    const currentItem =
      event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>(ITEM_SELECTOR)
        : null

    if (event.key === 'Tab') {
      event.preventDefault()
      focusAdjacentToTrigger(event.shiftKey)
      closeMenu({ reason: 'tab', originalEvent: event }, false)
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      focusItemAt(event.key === 'Home' ? 0 : getItems().length - 1)
      return
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const items = getItems()
      const currentIndex = currentItem ? items.indexOf(currentItem) : -1
      focusItemAt(
        currentIndex < 0
          ? event.key === 'ArrowUp'
            ? items.length - 1
            : 0
          : currentIndex + (event.key === 'ArrowUp' ? -1 : 1),
      )
      return
    }

    if (
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      handleTypeahead(event.key, currentItem)
    }
  }

  function menuAnchor(anchor: HTMLSpanElement) {
    function updateTrigger() {
      setTriggerElement(resolveTrigger(null, anchor))
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return

      const target = resolveTrigger(event.target, anchor)
      if (!target || triggerIsDisabled(target)) return

      setTriggerElement(target)

      if (open) {
        closeMenu({ reason: 'trigger', originalEvent: event })
      } else {
        openMenu('first', { reason: 'trigger', originalEvent: event })
      }
    }

    function handleKeydown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')
      ) {
        return
      }

      const target = resolveTrigger(event.target, anchor)
      if (!target || triggerIsDisabled(target)) return

      event.preventDefault()
      setTriggerElement(target)
      openMenu(event.key === 'ArrowUp' ? 'last' : 'first', {
        reason: 'trigger',
        originalEvent: event,
      })
    }

    updateTrigger()
    const observer = new MutationObserver(updateTrigger)
    observer.observe(anchor, { childList: true, subtree: true })
    anchor.addEventListener('click', handleClick)
    anchor.addEventListener('keydown', handleKeydown)

    return {
      destroy() {
        observer.disconnect()
        anchor.removeEventListener('click', handleClick)
        anchor.removeEventListener('keydown', handleKeydown)
        restoreTriggerAttributes()
        triggerElement = null
      },
    }
  }

  $effect(() => {
    menuId
    syncTriggerAttributes()

    if (open) {
      const justOpened = !wasOpen
      closing = false
      wasOpen = true

      if (justOpened) {
        positioned = false
        revealed = false
        needsInitialFocus = true
      }
    } else {
      revealed = false
      if (wasOpen && !closing) {
        restoreFocusAfterClose = true
        closing = true
        queueMicrotask(() => {
          if (!open && restoreFocusAfterClose && triggerElement?.isConnected) {
            triggerElement.focus()
            restoreFocusAfterClose = false
          }
        })
      }
      wasOpen = false
    }
  })

  $effect(() => {
    if (!open || !positioned) {
      revealed = false
      return
    }

    let firstFrame: number | undefined
    let secondFrame: number | undefined

    function reveal() {
      if (!open || !positioned) return

      revealed = true

      if (needsInitialFocus) {
        needsInitialFocus = false
        void tick().then(() => {
          if (open) focusInitialItem(pendingInitialFocus)
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

  onDestroy(() => {
    if (typeaheadTimer !== undefined) clearTimeout(typeaheadTimer)
    restoreTriggerAttributes()
  })
</script>

<span class="lds-menu-anchor" use:menuAnchor>
  {@render trigger()}

  <Overlay
    {open}
    {present}
    restoreFocus={false}
    class="lds-menu-overlay"
    onopenchange={handleOverlayOpenchange}
  >
    <FloatingLayer
      bind:element={menuElement}
      bind:positioned
      anchor={triggerElement}
      {open}
      {placement}
      {align}
      {gap}
      portal={false}
      stacked={false}
      {...menuAttributes}
      id={menuId}
      class={`lds-menu ${className}`}
      role="menu"
      aria-label={label}
      aria-orientation="vertical"
      aria-hidden={!open}
      inert={!open}
      data-lds-overlay-surface=""
      data-revealed={revealed}
      onkeydown={handleMenuKeydown}
    >
      <div
        bind:this={surfaceElement}
        class="lds-menu__surface"
        aria-hidden="true"
        ontransitionend={handleSurfaceTransitionend}
      ></div>
      <div class="lds-menu__clip" role="presentation">
        {@render children()}
      </div>
    </FloatingLayer>
  </Overlay>
</span>
