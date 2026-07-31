<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import { getMenuContext } from './menuContext'

  export type MenuItemVariant = 'default' | 'danger'

  export type MenuItemProps = Omit<
    HTMLButtonAttributes,
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
    leading?: Snippet
    trailing?: Snippet
    shortcut?: string
    variant?: MenuItemVariant
    disabled?: boolean
    closeOnSelect?: boolean
    class?: string
    onclick?: HTMLButtonAttributes['onclick']
    onpointermove?: HTMLButtonAttributes['onpointermove']
  }

  let {
    label,
    textValue = label,
    leading,
    trailing,
    shortcut,
    variant = 'default',
    disabled = false,
    closeOnSelect = true,
    class: className = '',
    onclick: userOnclick,
    onpointermove: userOnpointermove,
    ...attributes
  }: MenuItemProps = $props()

  const menu = getMenuContext()

  if (!menu) {
    throw new Error('MenuItem must be used inside Menu.')
  }

  const menuContext = menu

  function handleClick(
    event: MouseEvent & {
      currentTarget: EventTarget & HTMLButtonElement
    },
  ) {
    userOnclick?.(event)

    if (
      !event.defaultPrevented &&
      !event.currentTarget.disabled &&
      closeOnSelect
    ) {
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
  class={`lds-menu__item lds-menu__item--${variant} ${className}`}
  type="button"
  role="menuitem"
  tabindex="-1"
  {disabled}
  data-text-value={textValue}
  onclick={handleClick}
  onpointermove={handlePointermove}
>
  {#if leading}
    <span class="lds-menu__leading" aria-hidden="true">
      {@render leading()}
    </span>
  {/if}

  <span class="lds-menu__item-label">{label}</span>

  {#if shortcut}
    <kbd class="lds-menu__shortcut">{shortcut}</kbd>
  {/if}

  {#if trailing}
    <span class="lds-menu__trailing" aria-hidden="true">
      {@render trailing()}
    </span>
  {/if}
</button>
