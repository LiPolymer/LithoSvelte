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
    disabled = false,
    id,
    class: className = '',
  }: TooltipProps = $props()

  const componentId = $props.id()
  let tooltipId = $derived(id ?? `${componentId}-tooltip`)

  let triggerElement = $state<HTMLElement | null>(null)
  let showTimer: ReturnType<typeof setTimeout> | undefined
  let focusResetTimer: ReturnType<typeof setTimeout> | undefined
  let showRevision = 0
  let pointerInside = false
  let focusInside = false
  let focusFromPointer = false
  let visible = $state(false)

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
      },
    }
  }

  $effect(() => {
    if ((disabled || content.length === 0) && visible) {
      hide()
    }
  })
</script>

<span class="lds-tooltip-anchor" use:tooltipAnchor>
  {@render children()}

  <FloatingLayer
    anchor={triggerElement}
    open={visible}
    {placement}
    gap={8}
    viewportPadding={8}
    arrowPadding={10}
    id={tooltipId}
    class={`lds-tooltip ${className}`}
    role="tooltip"
    aria-hidden={!visible}
    data-visible={visible}
  >
    <span class="lds-tooltip__surface" aria-hidden="true"></span>
    <span class="lds-tooltip__arrow" aria-hidden="true"></span>
    <span class="lds-tooltip__clip">
      <span class="lds-tooltip__content">{content}</span>
    </span>
  </FloatingLayer>
</span>
