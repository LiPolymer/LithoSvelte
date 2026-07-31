<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type MenuLabelProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'class' | 'role'
  > & {
    children: Snippet
    class?: string
  }

  let {
    children,
    class: className = '',
    ...attributes
  }: MenuLabelProps = $props()
</script>

<div
  {...attributes}
  class={`lds-menu__label ${className}`}
  role="presentation"
>
  {@render children()}
</div>
