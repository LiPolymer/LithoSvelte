<script lang="ts">
  import iconSpriteUrl from '@gitlab/svgs/dist/icons.svg?url'
  import type { SVGAttributes } from 'svelte/elements'

  export type IconSize = number | string

  export type IconProps = Omit<
    SVGAttributes<SVGSVGElement>,
    | 'aria-hidden'
    | 'aria-label'
    | 'children'
    | 'class'
    | 'focusable'
    | 'height'
    | 'role'
    | 'width'
  > & {
    name: string
    size?: IconSize
    label?: string
    class?: string
  }

  let {
    name,
    size = 16,
    label,
    class: className = '',
    ...attributes
  }: IconProps = $props()

  let resolvedSize = $derived(
    typeof size === 'number' ? `${size}px` : size,
  )
</script>

<svg
  {...attributes}
  class={`lds-icon ${className}`}
  width={resolvedSize}
  height={resolvedSize}
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : 'true'}
  focusable="false"
  fill="currentColor"
>
  <use href={`${iconSpriteUrl}#${name}`} width="100%" height="100%"></use>
</svg>
