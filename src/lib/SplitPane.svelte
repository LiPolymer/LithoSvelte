<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type SplitPaneDirection = 'horizontal' | 'vertical'
  export type SplitPaneChangeReason = 'pointer' | 'keyboard' | 'reset'

  export type SplitPaneChangeDetails = {
    reason: SplitPaneChangeReason
    originalEvent: Event
  }

  type SplitPanePointerEvent = PointerEvent & {
    currentTarget: EventTarget & HTMLDivElement
  }

  type SplitPaneKeyboardEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLDivElement
  }

  type SplitPaneMouseEvent = MouseEvent & {
    currentTarget: EventTarget & HTMLDivElement
  }

  export type SplitPaneProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    | 'children'
    | 'class'
    | 'ondblclick'
    | 'onkeydown'
    | 'onpointercancel'
    | 'onpointerdown'
    | 'onpointermove'
    | 'onpointerup'
    | 'style'
  > & {
    first: Snippet
    second: Snippet
    label: string
    value?: number
    direction?: SplitPaneDirection
    min?: number
    max?: number
    step?: number
    resetValue?: number
    disabled?: boolean
    class?: string
    style?: string
    onvaluechange?: (
      value: number,
      details: SplitPaneChangeDetails,
    ) => void
    onvaluecommit?: (
      value: number,
      details: SplitPaneChangeDetails,
    ) => void
    onpointerdown?: HTMLAttributes<HTMLDivElement>['onpointerdown']
    onpointermove?: HTMLAttributes<HTMLDivElement>['onpointermove']
    onpointerup?: HTMLAttributes<HTMLDivElement>['onpointerup']
    onpointercancel?: HTMLAttributes<HTMLDivElement>['onpointercancel']
    onkeydown?: HTMLAttributes<HTMLDivElement>['onkeydown']
    ondblclick?: HTMLAttributes<HTMLDivElement>['ondblclick']
  }

  let {
    first,
    second,
    label,
    value = $bindable(50),
    direction = 'horizontal',
    min = 10,
    max = 90,
    step = 2,
    resetValue = 50,
    disabled = false,
    class: className = '',
    style: userStyle = '',
    onvaluechange,
    onvaluecommit,
    onpointerdown: userOnpointerdown,
    onpointermove: userOnpointermove,
    onpointerup: userOnpointerup,
    onpointercancel: userOnpointercancel,
    onkeydown: userOnkeydown,
    ondblclick: userOndblclick,
    ...attributes
  }: SplitPaneProps = $props()

  const componentId = $props.id()
  const firstPaneId = `${componentId}-first-pane`
  const secondPaneId = `${componentId}-second-pane`
  let rootElement = $state<HTMLDivElement>()
  let dragging = $state(false)
  let activePointerId: number | undefined
  let activeSeparator: HTMLDivElement | undefined

  let resolvedMin = $derived(clampBound(min))
  let resolvedMax = $derived(Math.max(resolvedMin, clampBound(max)))
  let resolvedValue = $derived(clampValue(value))
  let ariaOrientation: 'horizontal' | 'vertical' = $derived(
    direction === 'horizontal' ? 'vertical' : 'horizontal',
  )
  let resolvedStyle = $derived(
    [
      userStyle,
      `--lds-split-pane-position: ${resolvedValue}%`,
    ]
      .filter(Boolean)
      .join('; '),
  )

  function clampBound(next: number) {
    if (!Number.isFinite(next)) return 0
    return Math.min(Math.max(next, 0), 100)
  }

  function clampValue(next: number) {
    const finiteValue = Number.isFinite(next) ? next : resetValue
    return Math.min(Math.max(finiteValue, resolvedMin), resolvedMax)
  }

  function roundValue(next: number) {
    return Math.round(next * 1000) / 1000
  }

  function resolveSeparator(target: EventTarget | null) {
    const separator =
      target instanceof Element
        ? target.closest<HTMLDivElement>('.lds-split-pane__separator')
        : null

    return separator && rootElement?.contains(separator)
      ? separator
      : null
  }

  function setValue(
    next: number,
    details: SplitPaneChangeDetails,
  ) {
    const resolvedNext = roundValue(clampValue(next))
    if (resolvedNext === resolvedValue) return resolvedNext

    value = resolvedNext
    onvaluechange?.(resolvedNext, details)
    return resolvedNext
  }

  function valueFromPointer(event: PointerEvent) {
    if (!rootElement) return resolvedValue

    const rect = rootElement.getBoundingClientRect()
    const horizontal = direction === 'horizontal'
    const extent = horizontal ? rect.width : rect.height
    if (extent <= 0) return resolvedValue

    const offset = horizontal
      ? event.clientX - rect.left
      : event.clientY - rect.top
    const rawValue = (offset / extent) * 100
    const isRtl =
      horizontal && getComputedStyle(rootElement).direction === 'rtl'

    return isRtl ? 100 - rawValue : rawValue
  }

  function finishPointerInteraction(
    event: SplitPanePointerEvent,
    commit: boolean,
  ) {
    if (!dragging || event.pointerId !== activePointerId) return

    const details: SplitPaneChangeDetails = {
      reason: 'pointer',
      originalEvent: event,
    }
    const committedValue = setValue(valueFromPointer(event), details)

    if (
      activeSeparator?.hasPointerCapture(event.pointerId)
    ) {
      activeSeparator.releasePointerCapture(event.pointerId)
    }

    dragging = false
    activePointerId = undefined
    activeSeparator = undefined

    if (commit) onvaluecommit?.(committedValue, details)
  }

  function handlePointerdown(event: SplitPanePointerEvent) {
    userOnpointerdown?.(event)
    if (event.defaultPrevented || disabled || event.button !== 0) return

    const separator = resolveSeparator(event.target)
    if (!separator) return

    event.preventDefault()
    dragging = true
    activePointerId = event.pointerId
    activeSeparator = separator
    separator.setPointerCapture(event.pointerId)
    setValue(valueFromPointer(event), {
      reason: 'pointer',
      originalEvent: event,
    })
  }

  function handlePointermove(event: SplitPanePointerEvent) {
    userOnpointermove?.(event)
    if (
      event.defaultPrevented ||
      disabled ||
      !dragging ||
      event.pointerId !== activePointerId
    ) {
      return
    }

    setValue(valueFromPointer(event), {
      reason: 'pointer',
      originalEvent: event,
    })
  }

  function handlePointerup(event: SplitPanePointerEvent) {
    userOnpointerup?.(event)
    if (event.defaultPrevented) return
    finishPointerInteraction(event, true)
  }

  function handlePointercancel(event: SplitPanePointerEvent) {
    userOnpointercancel?.(event)
    if (event.defaultPrevented) return
    finishPointerInteraction(event, false)
  }

  function handleKeydown(event: SplitPaneKeyboardEvent) {
    userOnkeydown?.(event)
    if (
      event.defaultPrevented ||
      disabled ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      !resolveSeparator(event.target)
    ) {
      return
    }

    const details: SplitPaneChangeDetails = {
      reason: 'keyboard',
      originalEvent: event,
    }
    const keyboardStep = Math.max(Math.abs(step), 0.1) *
      (event.shiftKey ? 5 : 1)
    let nextValue: number | undefined

    if (event.key === 'Home') {
      nextValue = resolvedMin
    } else if (event.key === 'End') {
      nextValue = resolvedMax
    } else if (direction === 'horizontal') {
      const isRtl = rootElement
        ? getComputedStyle(rootElement).direction === 'rtl'
        : false
      if (event.key === 'ArrowLeft') {
        nextValue = resolvedValue + (isRtl ? keyboardStep : -keyboardStep)
      } else if (event.key === 'ArrowRight') {
        nextValue = resolvedValue + (isRtl ? -keyboardStep : keyboardStep)
      }
    } else if (event.key === 'ArrowUp') {
      nextValue = resolvedValue - keyboardStep
    } else if (event.key === 'ArrowDown') {
      nextValue = resolvedValue + keyboardStep
    }

    if (nextValue === undefined) return

    event.preventDefault()
    const committedValue = setValue(nextValue, details)
    onvaluecommit?.(committedValue, details)
  }

  function handleDblclick(event: SplitPaneMouseEvent) {
    userOndblclick?.(event)
    if (
      event.defaultPrevented ||
      disabled ||
      event.button !== 0 ||
      !resolveSeparator(event.target)
    ) {
      return
    }

    event.preventDefault()
    const details: SplitPaneChangeDetails = {
      reason: 'reset',
      originalEvent: event,
    }
    const committedValue = setValue(resetValue, details)
    onvaluecommit?.(committedValue, details)
  }

  $effect(() => {
    if (!disabled || !dragging) return

    if (
      activePointerId !== undefined &&
      activeSeparator?.hasPointerCapture(activePointerId)
    ) {
      activeSeparator.releasePointerCapture(activePointerId)
    }

    dragging = false
    activePointerId = undefined
    activeSeparator = undefined
  })
</script>

<div
  {...attributes}
  bind:this={rootElement}
  class={`lds-split-pane lds-split-pane--${direction} ${className}`}
  style={resolvedStyle}
  data-direction={direction}
  data-dragging={dragging}
  data-disabled={disabled}
  onpointerdown={handlePointerdown}
  onpointermove={handlePointermove}
  onpointerup={handlePointerup}
  onpointercancel={handlePointercancel}
  onkeydown={handleKeydown}
  ondblclick={handleDblclick}
>
  <div id={firstPaneId} class="lds-split-pane__panel lds-split-pane__first">
    {@render first()}
  </div>

  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    class="lds-split-pane__separator"
    role="separator"
    aria-label={label}
    aria-orientation={ariaOrientation}
    aria-valuemin={resolvedMin}
    aria-valuemax={resolvedMax}
    aria-valuenow={resolvedValue}
    aria-valuetext={`${Math.round(resolvedValue)}%`}
    aria-controls={`${firstPaneId} ${secondPaneId}`}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
  ></div>

  <div id={secondPaneId} class="lds-split-pane__panel lds-split-pane__second">
    {@render second()}
  </div>
</div>
