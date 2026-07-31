<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import Icon from './Icon.svelte'

  export type BadgeTone =
    | 'neutral'
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'error'

  export type BadgeVariant = 'soft' | 'outline'

  export type BadgeProps = Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > & {
    children: Snippet
    icon: string
    tone?: BadgeTone
    variant?: BadgeVariant
    class?: string
  }

  let {
    children,
    icon,
    tone = 'neutral',
    variant = 'soft',
    class: className = '',
    ...attributes
  }: BadgeProps = $props()
</script>

<span
  {...attributes}
  class={`lds-badge lds-badge--${tone} lds-badge--${variant} ${className}`}
  data-tone={tone}
  data-variant={variant}
>
  <Icon
    name={icon}
    size="var(--lds-badge-icon-size)"
    class="lds-badge__icon"
  />

  <span class="lds-badge__content">
    {@render children()}
  </span>
</span>
