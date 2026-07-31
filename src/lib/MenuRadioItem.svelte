<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import {
    getMenuContext,
    getMenuRadioGroupContext,
    type MenuValue,
  } from './menuContext'

  export type MenuRadioItemProps = Omit<
    HTMLButtonAttributes,
    | 'aria-checked'
    | 'children'
    | 'class'
    | 'disabled'
    | 'onclick'
    | 'onpointermove'
    | 'role'
    | 'tabindex'
    | 'type'
    | 'value'
  > & {
    value: MenuValue
    label: string
    textValue?: string
    shortcut?: string
    disabled?: boolean
    closeOnSelect?: boolean
    class?: string
    onclick?: HTMLButtonAttributes['onclick']
    onpointermove?: HTMLButtonAttributes['onpointermove']
  }

  let {
    value,
    label,
    textValue = label,
    shortcut,
    disabled = false,
    closeOnSelect = false,
    class: className = '',
    onclick: userOnclick,
    onpointermove: userOnpointermove,
    ...attributes
  }: MenuRadioItemProps = $props()

  const menu = getMenuContext()
  const radioGroup = getMenuRadioGroupContext()

  if (!menu || !radioGroup) {
    throw new Error(
      'MenuRadioItem must be used inside MenuRadioGroup and Menu.',
    )
  }

  const menuContext = menu
  const radioGroupContext = radioGroup

  let selected = $derived(radioGroupContext.value === value)
  let resolvedDisabled = $derived(disabled || radioGroupContext.disabled)

  function handleClick(
    event: MouseEvent & {
      currentTarget: EventTarget & HTMLButtonElement
    },
  ) {
    userOnclick?.(event)
    if (event.defaultPrevented || event.currentTarget.disabled) return

    radioGroupContext.select(value)

    if (closeOnSelect) {
      menuContext.close({ reason: 'select', originalEvent: event })
    }
  }

  function handlePointermove(
    event: PointerEvent & {
      currentTarget: EventTarget & HTMLButtonElement
    },
  ) {
    userOnpointermove?.(event)

    if (
      !event.defaultPrevented &&
      event.pointerType !== 'touch' &&
      !event.currentTarget.disabled &&
      document.activeElement !== event.currentTarget
    ) {
      event.currentTarget.focus({ preventScroll: true })
    }
  }
</script>

<button
  {...attributes}
  class={`lds-menu__item lds-menu__item--checked ${className}`}
  type="button"
  role="menuitemradio"
  aria-checked={selected}
  tabindex="-1"
  disabled={resolvedDisabled}
  data-text-value={textValue}
  onclick={handleClick}
  onpointermove={handlePointermove}
>
  <span class="lds-menu__indicator" aria-hidden="true">
    <span class="lds-menu__radio-mark"></span>
  </span>
  <span class="lds-menu__item-label">{label}</span>

  {#if shortcut}
    <kbd class="lds-menu__shortcut">{shortcut}</kbd>
  {/if}
</button>
