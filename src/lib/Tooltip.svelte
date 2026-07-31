<script lang="ts">
  import { tick, type Snippet } from 'svelte'

  export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left'

  type TooltipProps = {
    content: string
    children: Snippet
    placement?: TooltipPlacement
    delay?: number
    disabled?: boolean
    id?: string
    class?: string
  }

  const VIEWPORT_MARGIN = 8
  const TRIGGER_GAP = 8
  const ARROW_EDGE_MARGIN = 10
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
    disabled = false,
    id,
    class: className = '',
  }: TooltipProps = $props()

  const componentId = $props.id()
  let tooltipId = $derived(id ?? `${componentId}-tooltip`)

  let tooltipElement: HTMLDivElement
  let triggerElement: HTMLElement | null = null
  let showTimer: ReturnType<typeof setTimeout> | undefined
  let focusResetTimer: ReturnType<typeof setTimeout> | undefined
  let showRevision = 0
  let pointerInside = false
  let focusInside = false
  let focusFromPointer = false

  let visible = $state(false)
  let left = $state(0)
  let top = $state(0)
  let arrowOffset = $state(0)
  let resolvedPlacement = $state<TooltipPlacement>('top')

  function clearShowTimer() {
    if (showTimer !== undefined) {
      clearTimeout(showTimer)
      showTimer = undefined
    }
  }

  function removeDescription(target = triggerElement) {
    if (!target) return

    const descriptionIds = new Set(
      (target.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean),
    )

    descriptionIds.delete(tooltipId)

    if (descriptionIds.size > 0) {
      target.setAttribute(
        'aria-describedby',
        Array.from(descriptionIds).join(' '),
      )
    } else {
      target.removeAttribute('aria-describedby')
    }
  }

  function addDescription(target: HTMLElement) {
    if (triggerElement && triggerElement !== target) {
      removeDescription(triggerElement)
    }

    triggerElement = target

    const descriptionIds = new Set(
      (target.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean),
    )

    descriptionIds.add(tooltipId)
    target.setAttribute(
      'aria-describedby',
      Array.from(descriptionIds).join(' '),
    )
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

  function reposition() {
    if (!triggerElement || !tooltipElement) return

    const triggerRect = triggerElement.getBoundingClientRect()
    const tooltipWidth = tooltipElement.offsetWidth
    const tooltipHeight = tooltipElement.offsetHeight
    let nextPlacement = placement

    const room = {
      top: triggerRect.top - TRIGGER_GAP,
      right: window.innerWidth - triggerRect.right - TRIGGER_GAP,
      bottom: window.innerHeight - triggerRect.bottom - TRIGGER_GAP,
      left: triggerRect.left - TRIGGER_GAP,
    }

    if (
      placement === 'top' &&
      room.top < tooltipHeight + VIEWPORT_MARGIN &&
      room.bottom > room.top
    ) {
      nextPlacement = 'bottom'
    } else if (
      placement === 'bottom' &&
      room.bottom < tooltipHeight + VIEWPORT_MARGIN &&
      room.top > room.bottom
    ) {
      nextPlacement = 'top'
    } else if (
      placement === 'left' &&
      room.left < tooltipWidth + VIEWPORT_MARGIN &&
      room.right > room.left
    ) {
      nextPlacement = 'right'
    } else if (
      placement === 'right' &&
      room.right < tooltipWidth + VIEWPORT_MARGIN &&
      room.left > room.right
    ) {
      nextPlacement = 'left'
    }

    let nextLeft: number
    let nextTop: number

    switch (nextPlacement) {
      case 'right':
        nextLeft = triggerRect.right + TRIGGER_GAP
        nextTop =
          triggerRect.top + (triggerRect.height - tooltipHeight) / 2
        break
      case 'bottom':
        nextLeft =
          triggerRect.left + (triggerRect.width - tooltipWidth) / 2
        nextTop = triggerRect.bottom + TRIGGER_GAP
        break
      case 'left':
        nextLeft = triggerRect.left - tooltipWidth - TRIGGER_GAP
        nextTop =
          triggerRect.top + (triggerRect.height - tooltipHeight) / 2
        break
      default:
        nextLeft =
          triggerRect.left + (triggerRect.width - tooltipWidth) / 2
        nextTop = triggerRect.top - tooltipHeight - TRIGGER_GAP
    }

    const clampedLeft = Math.min(
      Math.max(nextLeft, VIEWPORT_MARGIN),
      window.innerWidth - tooltipWidth - VIEWPORT_MARGIN,
    )
    const clampedTop = Math.min(
      Math.max(nextTop, VIEWPORT_MARGIN),
      window.innerHeight - tooltipHeight - VIEWPORT_MARGIN,
    )

    left = clampedLeft
    top = clampedTop
    arrowOffset =
      nextPlacement === 'top' || nextPlacement === 'bottom'
        ? Math.min(
            Math.max(
              triggerRect.left + triggerRect.width / 2 - clampedLeft,
              ARROW_EDGE_MARGIN,
            ),
            tooltipWidth - ARROW_EDGE_MARGIN,
          )
        : Math.min(
            Math.max(
              triggerRect.top + triggerRect.height / 2 - clampedTop,
              ARROW_EDGE_MARGIN,
            ),
            tooltipHeight - ARROW_EDGE_MARGIN,
          )
    resolvedPlacement = nextPlacement
  }

  async function show(target: HTMLElement) {
    if (disabled || content.length === 0) return

    const revision = ++showRevision
    clearShowTimer()
    addDescription(target)

    await tick()

    if (
      revision !== showRevision ||
      disabled ||
      triggerElement !== target
    ) {
      return
    }

    reposition()
    visible = true
  }

  function scheduleShow(target: HTMLElement, immediately = false) {
    if (disabled || content.length === 0) return

    clearShowTimer()

    if (immediately || delay <= 0) {
      void show(target)
      return
    }

    showTimer = setTimeout(() => {
      showTimer = undefined
      void show(target)
    }, delay)
  }

  function hide() {
    clearShowTimer()
    showRevision += 1
    visible = false
    removeDescription()

    if (!pointerInside && !focusInside) {
      triggerElement = null
    }
  }

  function tooltipAnchor(anchor: HTMLSpanElement) {
    function handlePointerOver(event: PointerEvent) {
      if (
        event.defaultPrevented ||
        (event.relatedTarget instanceof Node &&
          anchor.contains(event.relatedTarget))
      ) {
        return
      }

      const target = resolveTrigger(event.target, anchor)
      if (!target) return

      pointerInside = true
      scheduleShow(target)
    }

    function handlePointerOut(event: PointerEvent) {
      if (
        event.relatedTarget instanceof Node &&
        anchor.contains(event.relatedTarget)
      ) {
        return
      }

      pointerInside = false
      if (!focusInside) hide()
    }

    function handlePointerDown() {
      focusFromPointer = true

      if (focusResetTimer !== undefined) {
        clearTimeout(focusResetTimer)
      }

      focusResetTimer = setTimeout(() => {
        focusFromPointer = false
        focusResetTimer = undefined
      })
    }

    function handleFocusIn(event: FocusEvent) {
      if (event.defaultPrevented) return

      const target = resolveTrigger(event.target, anchor)
      if (!target) return

      focusInside = true
      scheduleShow(target, !focusFromPointer)
    }

    function handleFocusOut(event: FocusEvent) {
      if (
        event.relatedTarget instanceof Node &&
        anchor.contains(event.relatedTarget)
      ) {
        return
      }

      focusInside = false
      if (!pointerInside) hide()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!event.defaultPrevented && event.key === 'Escape') {
        hide()
      }
    }

    anchor.addEventListener('pointerover', handlePointerOver)
    anchor.addEventListener('pointerout', handlePointerOut)
    anchor.addEventListener('pointerdown', handlePointerDown)
    anchor.addEventListener('focusin', handleFocusIn)
    anchor.addEventListener('focusout', handleFocusOut)
    anchor.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)

    return {
      destroy() {
        clearShowTimer()
        if (focusResetTimer !== undefined) {
          clearTimeout(focusResetTimer)
        }
        removeDescription()
        anchor.removeEventListener('pointerover', handlePointerOver)
        anchor.removeEventListener('pointerout', handlePointerOut)
        anchor.removeEventListener('pointerdown', handlePointerDown)
        anchor.removeEventListener('focusin', handleFocusIn)
        anchor.removeEventListener('focusout', handleFocusOut)
        anchor.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('resize', reposition)
        window.removeEventListener('scroll', reposition, true)
      },
    }
  }

  $effect(() => {
    content
    placement

    if ((disabled || content.length === 0) && visible) {
      hide()
    } else if (visible) {
      void tick().then(reposition)
    }
  })
</script>

<span class="lds-tooltip-anchor" use:tooltipAnchor>
  {@render children()}

  <div
    bind:this={tooltipElement}
    id={tooltipId}
    class={`lds-tooltip ${className}`}
    role="tooltip"
    aria-hidden={!visible}
    data-visible={visible}
    data-placement={resolvedPlacement}
    style={`left: ${left}px; top: ${top}px; --lds-tooltip-arrow-offset: ${arrowOffset}px;`}
  >
    <span class="lds-tooltip__surface" aria-hidden="true"></span>
    <span class="lds-tooltip__arrow" aria-hidden="true"></span>
    <span class="lds-tooltip__clip">
      <span class="lds-tooltip__content">{content}</span>
    </span>
  </div>
</span>
