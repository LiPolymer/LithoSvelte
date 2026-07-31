export type FloatingPlacement = 'top' | 'right' | 'bottom' | 'left'
export type FloatingAlign = 'start' | 'center' | 'end'

export type FloatingPositionOptions = {
  placement?: FloatingPlacement
  align?: FloatingAlign
  gap?: number
  viewportPadding?: number
  arrowPadding?: number
  flip?: boolean
  shift?: boolean
}

export type FloatingPosition = {
  x: number
  y: number
  placement: FloatingPlacement
  arrowOffset: number
}

type ViewportSize = {
  width: number
  height: number
}

const oppositePlacement: Record<FloatingPlacement, FloatingPlacement> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
}

function clamp(value: number, minimum: number, maximum: number) {
  if (maximum < minimum) return minimum
  return Math.min(Math.max(value, minimum), maximum)
}

function availableSpace(
  anchor: DOMRectReadOnly,
  viewport: ViewportSize,
  gap: number,
  padding: number,
): Record<FloatingPlacement, number> {
  return {
    top: anchor.top - gap - padding,
    right: viewport.width - anchor.right - gap - padding,
    bottom: viewport.height - anchor.bottom - gap - padding,
    left: anchor.left - gap - padding,
  }
}

function mainAxisSize(
  placement: FloatingPlacement,
  floating: DOMRectReadOnly,
) {
  return placement === 'top' || placement === 'bottom'
    ? floating.height
    : floating.width
}

function alignedCoordinate(
  start: number,
  anchorSize: number,
  floatingSize: number,
  align: FloatingAlign,
) {
  if (align === 'start') return start
  if (align === 'end') return start + anchorSize - floatingSize
  return start + (anchorSize - floatingSize) / 2
}

function baseCoordinates(
  anchor: DOMRectReadOnly,
  floating: DOMRectReadOnly,
  placement: FloatingPlacement,
  align: FloatingAlign,
  gap: number,
) {
  if (placement === 'top' || placement === 'bottom') {
    return {
      x: alignedCoordinate(
        anchor.left,
        anchor.width,
        floating.width,
        align,
      ),
      y:
        placement === 'top'
          ? anchor.top - floating.height - gap
          : anchor.bottom + gap,
    }
  }

  return {
    x:
      placement === 'left'
        ? anchor.left - floating.width - gap
        : anchor.right + gap,
    y: alignedCoordinate(
      anchor.top,
      anchor.height,
      floating.height,
      align,
    ),
  }
}

export function computeFloatingPosition(
  anchor: DOMRectReadOnly,
  floating: DOMRectReadOnly,
  viewport: ViewportSize,
  options: FloatingPositionOptions = {},
): FloatingPosition {
  const {
    placement: requestedPlacement = 'bottom',
    align = 'center',
    gap = 0,
    viewportPadding = 8,
    arrowPadding = 0,
    flip = true,
    shift = true,
  } = options

  const space = availableSpace(
    anchor,
    viewport,
    gap,
    viewportPadding,
  )
  const opposite = oppositePlacement[requestedPlacement]
  const requiredSpace = mainAxisSize(requestedPlacement, floating)
  const placement =
    flip &&
    space[requestedPlacement] < requiredSpace &&
    space[opposite] > space[requestedPlacement]
      ? opposite
      : requestedPlacement

  let { x, y } = baseCoordinates(
    anchor,
    floating,
    placement,
    align,
    gap,
  )

  if (shift) {
    x = clamp(
      x,
      viewportPadding,
      viewport.width - floating.width - viewportPadding,
    )
    y = clamp(
      y,
      viewportPadding,
      viewport.height - floating.height - viewportPadding,
    )
  }

  const horizontal = placement === 'top' || placement === 'bottom'
  const floatingSize = horizontal ? floating.width : floating.height
  const anchorCenter = horizontal
    ? anchor.left + anchor.width / 2 - x
    : anchor.top + anchor.height / 2 - y
  const safeArrowPadding = Math.min(arrowPadding, floatingSize / 2)

  return {
    x,
    y,
    placement,
    arrowOffset: clamp(
      anchorCenter,
      safeArrowPadding,
      floatingSize - safeArrowPadding,
    ),
  }
}

export function autoUpdateFloating(
  anchor: HTMLElement,
  floating: HTMLElement,
  update: () => void,
) {
  let frame: number | undefined

  function scheduleUpdate() {
    if (frame !== undefined) return

    frame = requestAnimationFrame(() => {
      frame = undefined
      update()
    })
  }

  const resizeObserver =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(scheduleUpdate)

  resizeObserver?.observe(anchor)
  resizeObserver?.observe(floating)
  window.addEventListener('resize', scheduleUpdate)
  window.addEventListener('scroll', scheduleUpdate, true)
  window.visualViewport?.addEventListener('resize', scheduleUpdate)
  window.visualViewport?.addEventListener('scroll', scheduleUpdate)
  update()

  return () => {
    if (frame !== undefined) cancelAnimationFrame(frame)
    resizeObserver?.disconnect()
    window.removeEventListener('resize', scheduleUpdate)
    window.removeEventListener('scroll', scheduleUpdate, true)
    window.visualViewport?.removeEventListener('resize', scheduleUpdate)
    window.visualViewport?.removeEventListener('scroll', scheduleUpdate)
  }
}
