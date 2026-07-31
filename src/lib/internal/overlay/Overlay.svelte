<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import {
    isOverlayTopmost,
    registerOverlay,
    type OverlayDismissDetails,
  } from './overlayStack'
  import { portal, type PortalTarget } from './portal'

  type OverlayPointerEvent = PointerEvent & {
    currentTarget: EventTarget & HTMLDivElement
  }

  export type OverlayProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    | 'children'
    | 'class'
    | 'hidden'
    | 'inert'
    | 'onpointerdown'
    | 'style'
  > & {
    open?: boolean
    present?: boolean
    children: Snippet
    modal?: boolean
    dismissOnEscape?: boolean
    dismissOnPointerOutside?: boolean
    restoreFocus?: boolean
    portalTarget?: PortalTarget
    element?: HTMLDivElement
    class?: string
    style?: string
    onpointerdown?: (event: OverlayPointerEvent) => void
    onopenchange?: (
      open: boolean,
      details: OverlayDismissDetails,
    ) => void
  }

  let {
    open = $bindable(false),
    present,
    children,
    modal = false,
    dismissOnEscape = true,
    dismissOnPointerOutside = true,
    restoreFocus = true,
    portalTarget,
    element = $bindable(),
    class: className = '',
    style: userStyle = '',
    onpointerdown: userOnpointerdown,
    onopenchange,
    ...attributes
  }: OverlayProps = $props()

  let registrationId = $state(0)
  let stackOrder = $state(0)
  let mounted = $derived(present ?? open)
  let resolvedStyle = $derived(
    [
      stackOrder > 0 &&
        `z-index: calc(var(--lds-layer-floating-base) + ${stackOrder})`,
      userStyle,
    ]
      .filter(Boolean)
      .join('; '),
  )

  function dismiss(details: OverlayDismissDetails) {
    if (!open) return
    open = false
    onopenchange?.(false, details)
  }

  function handlePointerdown(event: OverlayPointerEvent) {
    userOnpointerdown?.(event)

    if (
      event.defaultPrevented ||
      !open ||
      !dismissOnPointerOutside ||
      !registrationId ||
      !isOverlayTopmost(registrationId)
    ) {
      return
    }

    const insideSurface = event
      .composedPath()
      .some(
        (target) =>
          target instanceof Element &&
          target.hasAttribute('data-lds-overlay-surface'),
      )

    if (!insideSurface) {
      dismiss({
        reason: 'outside-pointer',
        originalEvent: event,
      })
    }
  }

  $effect(() => {
    if (!mounted || !element) {
      registrationId = 0
      stackOrder = 0
      return
    }

    const registration = registerOverlay({
      dismissOnEscape,
      modal,
      restoreFocus,
      onDismiss: dismiss,
      onLayerChange(order) {
        stackOrder = order
      },
    })

    registrationId = registration.id

    return () => {
      registration.unregister()
      registrationId = 0
    }
  })
</script>

<div
  {...attributes}
  bind:this={element}
  class={`lds-overlay ${className}`}
  style={resolvedStyle}
  hidden={!mounted}
  inert={!open}
  aria-hidden={!open}
  data-open={open}
  data-present={mounted}
  data-modal={modal}
  data-stack-order={stackOrder || undefined}
  onpointerdown={handlePointerdown}
  use:portal={portalTarget}
>
  {@render children()}
</div>
