<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import {
    getButtonGroupContext,
    isButtonGroupValue,
  } from './buttonGroupContext'

  let {
    children,
    class: className = '',
    type = 'button',
    value,
    onclick: userOnclick,
    'aria-pressed': ariaPressed,
    ...attributes
  }: HTMLButtonAttributes = $props()

  const buttonGroup = getButtonGroupContext()
  let isOption = $derived(buttonGroup?.mode === 'options')
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

<button
  {...attributes}
  {type}
  {value}
  class={`lds-btn lds-btn--primary ${isSelected ? 'lds-btn--selected' : ''} ${className}`}
  aria-pressed={isOption ? isSelected : ariaPressed}
  onclick={handleClick}
>
  {@render children?.()}
</button>
