<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import Icon from './Icon.svelte'
  import Tooltip, { type TooltipPlacement } from './Tooltip.svelte'
  import {
    getNavigationRailContext,
    type NavigationRailValue,
  } from './navigationRailContext'

  type NavigationRailItemClickEvent = MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement
  }

  export type NavigationRailItemProps = Omit<
    HTMLButtonAttributes,
    | 'aria-current'
    | 'aria-label'
    | 'children'
    | 'class'
    | 'onclick'
    | 'tabindex'
    | 'type'
    | 'value'
  > & {
    label: string
    value: NavigationRailValue
    icon: string
    class?: string
    disabled?: boolean
    tooltip?: boolean
    tooltipDelay?: number
    tooltipPlacement?: TooltipPlacement
    onclick?: HTMLButtonAttributes['onclick']
  }

  const rail = getNavigationRailContext()
  if (!rail) {
    throw new Error('NavigationRailItem must be used inside NavigationRail.')
  }
  const group = rail

  let {
    label,
    value,
    icon,
    id,
    class: className = '',
    disabled = false,
    tooltip = true,
    tooltipDelay = 350,
    tooltipPlacement = 'right',
    onclick: userOnclick,
    ...attributes
  }: NavigationRailItemProps = $props()

  const generatedId = group.createItemId()
  let itemId = $derived(id ?? generatedId)
  let isSelected = $derived(group.value === value)

  function handleClick(event: NavigationRailItemClickEvent) {
    userOnclick?.(event)
    if (event.defaultPrevented || disabled) return

    group.activate(itemId)
    group.select(value)
  }
</script>

<li class="lds-navigation-rail__entry">
  <Tooltip
    content={label}
    placement={tooltipPlacement}
    delay={tooltipDelay}
    disabled={!tooltip || group.expanded}
  >
    <button
      {...attributes}
      id={itemId}
      class={`lds-navigation-rail__item ${className}`}
      type="button"
      {disabled}
      aria-label={label}
      aria-current={isSelected ? 'page' : undefined}
      tabindex={group.activeId === itemId ? 0 : -1}
      data-label={label}
      data-selected={isSelected || undefined}
      onclick={handleClick}
    >
      <Icon
        name={icon}
        size="var(--lds-navigation-rail-icon-size)"
      />
      <span class="lds-navigation-rail__label" aria-hidden="true">
        {label}
      </span>
    </button>
  </Tooltip>
</li>
