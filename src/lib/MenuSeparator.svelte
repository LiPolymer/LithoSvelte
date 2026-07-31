<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  export type MenuSeparatorProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    'aria-orientation' | 'class' | 'role'
  > & {
    class?: string
  }

  let {
    class: className = '',
    ...attributes
  }: MenuSeparatorProps = $props()
</script>

<div
  {...attributes}
  class={`lds-menu__separator ${className}`}
  role="separator"
  aria-orientation="horizontal"
></div>
