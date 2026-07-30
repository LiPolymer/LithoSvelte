<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'

  let {
    children,
    class: className = '',
    type = 'button',
    ...attributes
  }: HTMLButtonAttributes = $props()
</script>

<button
  {...attributes}
  {type}
  class={`lds-btn lds-btn--primary ${className}`}
>
  {@render children?.()}
</button>
