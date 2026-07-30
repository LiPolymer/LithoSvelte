<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import {
    getButtonGroupContext,
    isButtonGroupValue,
  } from './buttonGroupContext'

  type PrimaryButtonProps = HTMLButtonAttributes & {
    expressive?: boolean
  }

  let {
    children,
    class: className = '',
    type = 'button',
    expressive = true,
    value,
    onclick: userOnclick,
    'aria-pressed': ariaPressed,
    ...attributes
  }: PrimaryButtonProps = $props()

  const buttonGroup = getButtonGroupContext()
  let isOption = $derived(buttonGroup?.mode === 'options')
  let isExpressive = $derived(expressive && !buttonGroup)
  let isSelected = $derived(
    isOption &&
      isButtonGroupValue(value) &&
      buttonGroup?.value === value,
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
  class={`lds-btn lds-btn--primary ${isExpressive ? 'lds-btn--primary-expressive' : ''} ${isSelected ? 'lds-btn--selected' : ''} ${className}`}
  aria-pressed={isOption ? isSelected : ariaPressed}
  onclick={handleClick}
>
  {@render children?.()}
</button>
