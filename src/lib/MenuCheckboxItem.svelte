<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import Icon from './Icon.svelte'
  import { getMenuContext } from './menuContext'

  export type MenuCheckboxItemProps = Omit<
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
  > & {
    label: string
    textValue?: string
    checked?: boolean
    shortcut?: string
    disabled?: boolean
    closeOnSelect?: boolean
    class?: string
    onclick?: HTMLButtonAttributes['onclick']
    onpointermove?: HTMLButtonAttributes['onpointermove']
    oncheckedchange?: (checked: boolean) => void
  }

  let {
    label,
    textValue = label,
    checked = $bindable(false),
    shortcut,
    disabled = false,
    closeOnSelect = false,
    class: className = '',
    onclick: userOnclick,
    onpointermove: userOnpointermove,
    oncheckedchange,
    ...attributes
  }: MenuCheckboxItemProps = $props()

  const menu = getMenuContext()

  if (!menu) {
    throw new Error('MenuCheckboxItem must be used inside Menu.')
  }

  const menuContext = menu

  function handleClick(
    event: MouseEvent & {
      currentTarget: EventTarget & HTMLButtonElement
    },
  ) {
    userOnclick?.(event)
    if (event.defaultPrevented || event.currentTarget.disabled) return

    checked = !checked
    oncheckedchange?.(checked)

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
  role="menuitemcheckbox"
  aria-checked={checked}
  tabindex="-1"
  {disabled}
  data-text-value={textValue}
  onclick={handleClick}
  onpointermove={handlePointermove}
>
  <span class="lds-menu__indicator" aria-hidden="true">
    <Icon name="check" size={12} />
  </span>
  <span class="lds-menu__item-label">{label}</span>

  {#if shortcut}
    <kbd class="lds-menu__shortcut">{shortcut}</kbd>
  {/if}
</button>
