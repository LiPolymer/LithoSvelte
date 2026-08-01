<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import {
    getButtonGroupContext,
    isButtonGroupValue,
  } from './buttonGroupContext'
  import Icon, { type IconSize } from './Icon.svelte'

  export type IconButtonVariant = 'ghost' | 'tonal' | 'primary'
  export type IconButtonSize = 'compact' | 'default'

  export type IconButtonProps = Omit<HTMLButtonAttributes, 'children'> & {
    icon: string
    label: string
    variant?: IconButtonVariant
    size?: IconButtonSize
    iconSize?: IconSize
  }

  let {
    icon,
    label,
    variant = 'ghost',
    size = 'compact',
    iconSize,
    class: className = '',
    type = 'button',
    value,
    onclick: userOnclick,
    'aria-pressed': ariaPressed,
    ...attributes
  }: IconButtonProps = $props()

  const buttonGroup = getButtonGroupContext()
  let isOption = $derived(buttonGroup?.mode === 'options')
  let isSelected = $derived(
    isOption &&
      isButtonGroupValue(value) &&
      buttonGroup?.value === value,
  )
  let pressed = $derived(isOption ? isSelected : ariaPressed)
  let isVisuallySelected = $derived(
    pressed === true || pressed === 'true',
  )
  let resolvedIconSize = $derived(
    iconSize ??
      (size === 'compact'
        ? 'var(--lds-icon-button-icon-size-compact)'
        : 'var(--lds-icon-button-icon-size)'),
  )

  function handleClick(
    event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
  ) {
    userOnclick?.(event)

    if (
      !event.defaultPrevented &&
      !event.currentTarget.disabled &&
      isOption &&
      isButtonGroupValue(value)
    ) {
      buttonGroup?.select(value)
    }
  }
</script>

{#if buttonGroup}
  <span class="lds-button-group__divider" aria-hidden="true"></span>
{/if}

<button
  {...attributes}
  {type}
  {value}
  class={`lds-btn lds-btn--${variant} lds-icon-btn lds-icon-btn--${size} ${isVisuallySelected ? 'lds-btn--selected' : ''} ${className}`}
  aria-label={label}
  aria-pressed={pressed}
  onclick={handleClick}
>
  <Icon name={icon} size={resolvedIconSize} />
</button>
