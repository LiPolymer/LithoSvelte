<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import Icon from './Icon.svelte'
  import { getTabsContext, type TabsValue } from './tabsContext'

  type TabClickEvent = MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement
  }

  export type TabProps = Omit<
    HTMLButtonAttributes,
    | 'aria-controls'
    | 'aria-selected'
    | 'children'
    | 'class'
    | 'disabled'
    | 'id'
    | 'onclick'
    | 'role'
    | 'tabindex'
    | 'type'
    | 'value'
  > & {
    children: Snippet
    value: TabsValue
    icon?: string
    class?: string
    disabled?: boolean
    onclick?: HTMLButtonAttributes['onclick']
  }

  let {
    children,
    value,
    icon,
    class: className = '',
    disabled = false,
    onclick: userOnclick,
    ...attributes
  }: TabProps = $props()

  const tabs = getTabsContext()
  if (!tabs) throw new Error('Tab must be used inside Tabs.')
  const group = tabs

  let isSelected = $derived(group.value === value)

  function handleClick(event: TabClickEvent) {
    userOnclick?.(event)
    if (event.defaultPrevented || event.currentTarget.disabled) return

    group.select(value)
  }
</script>

<button
  {...attributes}
  id={group.getTabId(value)}
  class={`lds-tab ${className}`}
  type="button"
  role="tab"
  {disabled}
  aria-controls={group.getPanelId(value)}
  aria-selected={isSelected}
  tabindex={isSelected ? 0 : -1}
  data-value={value}
  onclick={handleClick}
>
  {#if icon}
    <Icon name={icon} size="var(--lds-tab-icon-size)" />
  {/if}

  <span class="lds-tab__label">
    {@render children()}
  </span>
</button>
