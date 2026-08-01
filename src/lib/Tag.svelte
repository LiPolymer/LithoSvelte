<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import type { BadgeTone, BadgeVariant } from './Badge.svelte'
  import Icon from './Icon.svelte'

  export type TagRemoveEvent = MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement
  }

  export type TagProps = Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > & {
    children: Snippet
    removeLabel: string
    onremove: (event: TagRemoveEvent) => void
    icon?: string
    tone?: BadgeTone
    variant?: BadgeVariant
    class?: string
    disabled?: boolean
  }

  let {
    children,
    removeLabel,
    onremove,
    icon,
    tone = 'neutral',
    variant = 'soft',
    class: className = '',
    disabled = false,
    ...attributes
  }: TagProps = $props()

  function handleRemove(event: TagRemoveEvent) {
    onremove(event)
  }
</script>

<span
  {...attributes}
  class={`lds-tag lds-tag--${tone} lds-tag--${variant} ${className}`}
  data-tone={tone}
  data-variant={variant}
  data-disabled={disabled || undefined}
>
  <span class="lds-tag__body">
    {#if icon}
      <Icon
        name={icon}
        size="var(--lds-tag-icon-size)"
        class="lds-tag__icon"
      />
    {/if}

    <span class="lds-tag__content">
      {@render children()}
    </span>
  </span>

  <button
    class="lds-tag__remove"
    type="button"
    {disabled}
    aria-label={removeLabel}
    onclick={handleRemove}
  >
    <Icon name="close-xs" size="var(--lds-tag-remove-icon-size)" />
  </button>
</span>
