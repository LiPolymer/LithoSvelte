<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import Icon from './Icon.svelte'
  import Tooltip, { type TooltipPlacement } from './Tooltip.svelte'
  import {
    getNavigationRailContext,
    getNavigationRailLevel,
    setNavigationRailLevel,
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
    children?: Snippet
    class?: string
    disabled?: boolean
    expanded?: boolean
    tooltip?: boolean
    tooltipDelay?: number
    tooltipPlacement?: TooltipPlacement
    onexpandedchange?: (expanded: boolean) => void
    ondisclosureclick?: HTMLButtonAttributes['onclick']
    onclick?: HTMLButtonAttributes['onclick']
  }

  const rail = getNavigationRailContext()
  if (!rail) {
    throw new Error('NavigationRailItem must be used inside NavigationRail.')
  }
  const group = rail
  const level = getNavigationRailLevel()
  setNavigationRailLevel(level + 1)

  let {
    label,
    value,
    icon,
    children,
    id,
    class: className = '',
    disabled = false,
    expanded = $bindable(false),
    tooltip = true,
    tooltipDelay = 350,
    tooltipPlacement = 'right',
    onexpandedchange,
    ondisclosureclick: userOndisclosureclick,
    onclick: userOnclick,
    ...attributes
  }: NavigationRailItemProps = $props()

  const generatedId = group.createItemId()
  let itemId = $derived(id ?? generatedId)
  let groupId = $derived(`${itemId}-group`)
  let itemElement = $state<HTMLButtonElement>()
  let isBranch = $derived(Boolean(children))
  let isSelected = $derived(group.value === value)
  let isVisiblyExpanded = $derived(
    isBranch && group.expanded && expanded && !disabled,
  )

  function handleClick(event: NavigationRailItemClickEvent) {
    userOnclick?.(event)
    if (event.defaultPrevented || disabled) return

    group.activate(itemId)
    group.select(value)
  }

  function handleDisclosureClick(
    event: MouseEvent & {
      currentTarget: EventTarget & HTMLButtonElement
    },
  ) {
    userOndisclosureclick?.(event)
    if (event.defaultPrevented || disabled || !isBranch) return

    event.preventDefault()
    event.stopPropagation()
    group.activate(itemId)
    itemElement?.focus()
    expanded = !expanded
    onexpandedchange?.(expanded)
  }
</script>

<li
  class="lds-navigation-rail__entry"
  data-branch={isBranch || undefined}
  data-expanded={isVisiblyExpanded || undefined}
  data-level={level}
>
  <div class="lds-navigation-rail__row">
    {#if isBranch}
      <button
        class="lds-navigation-rail__disclosure"
        type="button"
        disabled={disabled || !group.expanded}
        tabindex="-1"
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
        aria-controls={groupId}
        aria-expanded={isVisiblyExpanded}
        onclick={handleDisclosureClick}
      >
        <Icon
          name="chevron-right"
          size="var(--lds-navigation-rail-disclosure-size)"
        />
      </button>
    {/if}

    <Tooltip
      content={label}
      placement={tooltipPlacement}
      delay={tooltipDelay}
      disabled={!tooltip || group.expanded}
    >
      <button
        bind:this={itemElement}
        {...attributes}
        id={itemId}
        class={`lds-navigation-rail__item ${className}`}
        type="button"
        {disabled}
        aria-label={label}
        aria-current={isSelected ? 'page' : undefined}
        aria-expanded={isBranch ? isVisiblyExpanded : undefined}
        aria-controls={isBranch ? groupId : undefined}
        tabindex={group.activeId === itemId ? 0 : -1}
        data-branch={isBranch || undefined}
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
  </div>

  {#if children}
    <div
      id={groupId}
      class="lds-navigation-rail__group-clip"
      data-open={isVisiblyExpanded}
      aria-hidden={!isVisiblyExpanded}
      inert={!isVisiblyExpanded}
    >
      <ul class="lds-navigation-rail__group">
        {@render children()}
      </ul>
    </div>
  {/if}
</li>
