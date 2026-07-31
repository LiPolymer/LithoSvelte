<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import {
    getToolbarContext,
    type ToolbarOrientation,
  } from './toolbarContext'

  export type SeparatorOrientation = ToolbarOrientation

  export type ToolbarSeparatorProps = Omit<
    HTMLAttributes<HTMLSpanElement>,
    'aria-orientation' | 'class' | 'role'
  > & {
    class?: string
    orientation?: SeparatorOrientation
  }

  let {
    class: className = '',
    orientation,
    ...attributes
  }: ToolbarSeparatorProps = $props()

  const toolbar = getToolbarContext()
  let resolvedOrientation = $derived(
    orientation ??
      (toolbar?.orientation === 'vertical' ? 'horizontal' : 'vertical'),
  )
</script>

<span
  {...attributes}
  class={`lds-toolbar__separator lds-toolbar__separator--${resolvedOrientation} ${className}`}
  role="separator"
  aria-orientation={resolvedOrientation}
></span>
