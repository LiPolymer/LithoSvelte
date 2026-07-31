<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  type ListboxPopupProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'class' | 'role'
  > & {
    label: string
    open: boolean
    children: Snippet
    class?: string
    oncollapsecomplete?: () => void
  }

  let {
    label,
    open,
    children,
    class: className = '',
    oncollapsecomplete,
    ...attributes
  }: ListboxPopupProps = $props()

  let surfaceElement = $state<HTMLDivElement>()
  let wasOpen = false

  $effect(() => {
    if (open) {
      wasOpen = true
      return
    }

    if (!wasOpen || !surfaceElement) {
      return
    }

    const transitionDurations = getComputedStyle(
      surfaceElement,
    ).transitionDuration
      .split(',')
      .map((duration) => duration.trim())
    const hasMotion = transitionDurations.some(
      (duration) => Number.parseFloat(duration) > 0,
    )

    if (!hasMotion) {
      queueMicrotask(() => {
        if (!open && wasOpen) {
          wasOpen = false
          oncollapsecomplete?.()
        }
      })
    }
  })

  function handleSurfaceTransitionend(event: TransitionEvent) {
    if (
      event.currentTarget === event.target &&
      event.propertyName === 'transform' &&
      !open
    ) {
      wasOpen = false
      oncollapsecomplete?.()
    }
  }
</script>

<div
  {...attributes}
  class={`lds-field__listbox ${className}`}
  role="listbox"
  aria-label={label}
  aria-hidden={!open}
  inert={!open}
  data-open={open}
>
  <div
    class="lds-field__listbox-surface"
    aria-hidden="true"
    bind:this={surfaceElement}
    ontransitionend={handleSurfaceTransitionend}
  ></div>
  <div class="lds-field__listbox-clip">
    {@render children()}
  </div>
</div>
