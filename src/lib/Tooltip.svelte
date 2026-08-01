<script lang="ts" module>
  let pointerWarmUntil = 0
</script>

<script lang="ts">
  import { tick, type Snippet } from 'svelte'
  import FloatingLayer from './internal/overlay/FloatingLayer.svelte'
  import type { FloatingPlacement } from './internal/overlay'

  export type TooltipPlacement = FloatingPlacement

  export type TooltipProps = {
    content: string
    children: Snippet
    placement?: TooltipPlacement
    delay?: number
    skipDelay?: number
    disabled?: boolean
    id?: string
    class?: string
  }

  const TRIGGER_SELECTOR = [
    '[data-lds-tooltip-trigger]',
    'button',
    'a[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]',
  ].join(',')

  let {
    content,
    children,
    placement = 'top',
    delay = 500,
    skipDelay = 300,
    disabled = false,
    id,
    class: className = '',
  }: TooltipProps = $props()

  const componentId = $props.id()
  let tooltipId = $derived(id ?? `${componentId}-tooltip`)
  let hasContent = $derived(content.trim().length > 0)

  let triggerElement = $state<HTMLElement | null>(null)
  let describedElement: HTMLElement | null = null
  let describedId: string | undefined
  let descriptionOwned = false
  let showTimer: ReturnType<typeof setTimeout> | undefined
  let revealFrame: number | undefined
  let showRevision = 0
  let pointerInside = false
  let focusInside = false
  let suppressPointerFocus = false
  let openedBy: 'pointer' | 'focus' | undefined
  let open = $state(false)
  let positioned = $state(false)
  let revealed = $state(false)

  function clearShowTimer() {
    if (showTimer !== undefined) {
      clearTimeout(showTimer)
      showTimer = undefined
    }
  }

  function clearRevealFrame() {
    if (revealFrame !== undefined) {
      cancelAnimationFrame(revealFrame)
      revealFrame = undefined
    }
  }

  function removeDescription() {
    if (!describedElement || !describedId) return

    const descriptionIds = new Set(
      (describedElement.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean),
    )

    if (descriptionOwned) {
      descriptionIds.delete(describedId)
    }

    if (descriptionIds.size > 0) {
      describedElement.setAttribute(
        'aria-describedby',
        Array.from(descriptionIds).join(' '),
      )
    } else {
      describedElement.removeAttribute('aria-describedby')
    }

    describedElement = null
    describedId = undefined
    descriptionOwned = false
  }

  function addDescription(target: HTMLElement) {
    if (describedElement !== target || describedId !== tooltipId) {
      removeDescription()
    }

    triggerElement = target

    const descriptionIds = new Set(
      (target.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean),
    )

    descriptionOwned = !descriptionIds.has(tooltipId)
    descriptionIds.add(tooltipId)
    target.setAttribute(
      'aria-describedby',
      Array.from(descriptionIds).join(' '),
    )
    describedElement = target
    describedId = tooltipId
  }

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

  async function show(
    target: HTMLElement,
    reason: 'pointer' | 'focus',
  ) {
    if (disabled || !hasContent) return

    if (open && triggerElement === target) return

    const revision = ++showRevision
    clearShowTimer()
    clearRevealFrame()
    addDescription(target)
    openedBy = reason
    positioned = false
    revealed = false
    open = true

    await tick()

    if (
      revision !== showRevision ||
      disabled ||
      !hasContent ||
      triggerElement !== target
    ) {
      return
    }
  }

  function scheduleShow(
    target: HTMLElement,
    reason: 'pointer' | 'focus',
    immediately = false,
  ) {
    if (disabled || !hasContent) return

    clearShowTimer()

    const skipPointerDelay =
      reason === 'pointer' && Date.now() < pointerWarmUntil

    if (immediately || skipPointerDelay || delay <= 0) {
      void show(target, reason)
      return
    }

    showTimer = setTimeout(() => {
      showTimer = undefined
      void show(target, reason)
    }, delay)
  }

  function hide() {
    const warmPointerSequence = open && openedBy === 'pointer'

    clearShowTimer()
    clearRevealFrame()
    showRevision += 1
    revealed = false
    open = false
    positioned = false
    removeDescription()
    openedBy = undefined

    if (warmPointerSequence) {
      pointerWarmUntil = Date.now() + Math.max(0, skipDelay)
    }

    if (!pointerInside && !focusInside) {
      triggerElement = null
    }
  }

  function tooltipAnchor(anchor: HTMLSpanElement) {
    function handlePointerOver(event: PointerEvent) {
      if (
        event.defaultPrevented ||
        event.pointerType === 'touch' ||
        (event.relatedTarget instanceof Node &&
          anchor.contains(event.relatedTarget))
      ) {
        return
      }

      const target = resolveTrigger(event.target, anchor)
      if (!target) return

      suppressPointerFocus = false
      pointerInside = true
      scheduleShow(target, 'pointer')
    }

    function handlePointerOut(event: PointerEvent) {
      if (
        event.relatedTarget instanceof Node &&
        anchor.contains(event.relatedTarget)
      ) {
        return
      }

      pointerInside = false
      suppressPointerFocus = false
      if (!focusInside) hide()
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.defaultPrevented) return

      suppressPointerFocus = true
      hide()
    }

    function handleFocusIn(event: FocusEvent) {
      if (event.defaultPrevented) return

      const target = resolveTrigger(event.target, anchor)
      if (!target) return

      focusInside = true
      if (!suppressPointerFocus) {
        scheduleShow(target, 'focus', true)
      }
    }

    function handleFocusOut(event: FocusEvent) {
      if (
        event.relatedTarget instanceof Node &&
        anchor.contains(event.relatedTarget)
      ) {
        return
      }

      focusInside = false
      suppressPointerFocus = false
      if (!pointerInside) hide()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.key !== 'Escape' ||
        (!open && showTimer === undefined)
      ) return

      event.preventDefault()
      event.stopPropagation()
      hide()
    }

    anchor.addEventListener('pointerover', handlePointerOver)
    anchor.addEventListener('pointerout', handlePointerOut)
    anchor.addEventListener('pointerdown', handlePointerDown)
    anchor.addEventListener('focusin', handleFocusIn)
    anchor.addEventListener('focusout', handleFocusOut)
    anchor.addEventListener('keydown', handleKeyDown)

    return {
      destroy() {
        clearShowTimer()
        clearRevealFrame()
        showRevision += 1
        removeDescription()
        anchor.removeEventListener('pointerover', handlePointerOver)
        anchor.removeEventListener('pointerout', handlePointerOut)
        anchor.removeEventListener('pointerdown', handlePointerDown)
        anchor.removeEventListener('focusin', handleFocusIn)
        anchor.removeEventListener('focusout', handleFocusOut)
        anchor.removeEventListener('keydown', handleKeyDown)
      },
    }
  }

  $effect(() => {
    if (disabled || !hasContent) {
      hide()
    }
  })

  $effect(() => {
    const currentTooltipId = tooltipId
    const currentTrigger = triggerElement

    if (
      open &&
      currentTrigger &&
      describedId !== currentTooltipId
    ) {
      addDescription(currentTrigger)
    }
  })

  $effect(() => {
    if (!open || !positioned) {
      revealed = false
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealed = true
      return
    }

    revealFrame = requestAnimationFrame(() => {
      revealFrame = undefined

      if (open && positioned) {
        revealed = true
      }
    })

    return clearRevealFrame
  })
</script>

<span class="lds-tooltip-anchor" use:tooltipAnchor>
  {@render children()}

  <FloatingLayer
    bind:positioned
    anchor={triggerElement}
    {open}
    {placement}
    gap={8}
    viewportPadding={8}
    arrowPadding={10}
    id={tooltipId}
    class={`lds-tooltip ${className}`}
    role="tooltip"
    aria-hidden={!revealed}
    data-visible={revealed}
  >
    <span class="lds-tooltip__surface" aria-hidden="true"></span>
    <span class="lds-tooltip__arrow" aria-hidden="true"></span>
    <span class="lds-tooltip__clip">
      <span class="lds-tooltip__content">{content}</span>
    </span>
  </FloatingLayer>
</span>
