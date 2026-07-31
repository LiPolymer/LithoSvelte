<script lang="ts">
  import { tick, type Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import {
    autoUpdateFloating,
    computeFloatingPosition,
    type FloatingAlign,
    type FloatingPlacement,
  } from './floating'
  import { registerOverlay } from './overlayStack'
  import { portal, type PortalTarget } from './portal'

  export type FloatingLayerProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'class' | 'style'
  > & {
    element?: HTMLDivElement
    positioned?: boolean
    anchor?: HTMLElement | null
    open: boolean
    children: Snippet
    placement?: FloatingPlacement
    align?: FloatingAlign
    gap?: number
    viewportPadding?: number
    arrowPadding?: number
    flip?: boolean
    shift?: boolean
    portal?: boolean
    portalTarget?: PortalTarget
    stacked?: boolean
    class?: string
    style?: string | null
  }

  let {
    element = $bindable<HTMLDivElement>(),
    positioned = $bindable(false),
    anchor,
    open,
    children,
    placement = 'bottom',
    align = 'center',
    gap = 0,
    viewportPadding = 8,
    arrowPadding = 0,
    flip = true,
    shift = true,
    portal: shouldPortal = true,
    portalTarget,
    stacked = true,
    class: className = '',
    style: userStyle = '',
    ...attributes
  }: FloatingLayerProps = $props()

  let x = $state(0)
  let y = $state(0)
  let arrowOffset = $state(0)
  let resolvedPlacement = $state<FloatingPlacement>('bottom')
  let stackOrder = $state(0)

  let resolvedStyle = $derived(
    [
      `left: ${x}px`,
      `top: ${y}px`,
      `--lds-floating-arrow-offset: ${arrowOffset}px`,
      stackOrder > 0 &&
        `z-index: calc(var(--lds-layer-floating-base) + ${stackOrder})`,
      userStyle,
    ]
      .filter(Boolean)
      .join('; '),
  )

  $effect(() => {
    const currentAnchor = anchor
    const currentLayer = element

    placement
    align
    gap
    viewportPadding
    arrowPadding
    flip
    shift
    open
    positioned

    if (!currentLayer) {
      positioned = false
      return
    }

    if (!currentAnchor) return

    const observedAnchor: HTMLElement = currentAnchor
    const observedLayer: HTMLDivElement = currentLayer
    let disposed = false
    let stopAutoUpdate: (() => void) | undefined

    function updatePosition() {
      if (
        disposed ||
        !observedAnchor.isConnected ||
        !observedLayer.isConnected
      ) {
        return
      }

      const floatingRect = observedLayer.getBoundingClientRect()

      if (floatingRect.width === 0 || floatingRect.height === 0) {
        positioned = false
        return
      }

      const position = computeFloatingPosition(
        observedAnchor.getBoundingClientRect(),
        floatingRect,
        {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        {
          placement,
          align,
          gap,
          viewportPadding,
          arrowPadding,
          flip,
          shift,
        },
      )

      x = position.x
      y = position.y
      arrowOffset = position.arrowOffset
      resolvedPlacement = position.placement
      positioned = true
    }

    void tick().then(() => {
      if (disposed) return
      stopAutoUpdate = autoUpdateFloating(
        observedAnchor,
        observedLayer,
        updatePosition,
      )
    })

    return () => {
      disposed = true
      stopAutoUpdate?.()
    }
  })

  $effect(() => {
    if (!open || !stacked) {
      if (!stacked) stackOrder = 0
      return
    }

    const registration = registerOverlay({
      onLayerChange(order) {
        stackOrder = order
      },
    })

    return registration.unregister
  })
</script>

<div
  {...attributes}
  bind:this={element}
  class={`lds-floating-layer ${className}`}
  style={resolvedStyle}
  data-open={open}
  data-positioned={positioned}
  data-placement={resolvedPlacement}
  data-stack-order={stackOrder || undefined}
  use:portal={shouldPortal ? portalTarget : false}
>
  {@render children()}
</div>
