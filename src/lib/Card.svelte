<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type CardElement = 'article' | 'aside' | 'div' | 'section'
  export type CardVariant = 'subtle' | 'filled' | 'outlined'
  export type CardDensity = 'compact' | 'default'

  export type CardProps = Omit<
    HTMLAttributes<HTMLElement>,
    'children' | 'class'
  > & {
    children: Snippet
    as?: CardElement
    variant?: CardVariant
    density?: CardDensity
    class?: string
  }

  let {
    children,
    as = 'div',
    variant = 'subtle',
    density = 'default',
    class: className = '',
    ...attributes
  }: CardProps = $props()
</script>

<svelte:element
  this={as}
  {...attributes}
  class={`lds-card lds-card--${variant} lds-card--${density} ${className}`}
  data-density={density}
  data-variant={variant}
>
  {@render children()}
</svelte:element>
