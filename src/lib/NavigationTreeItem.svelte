<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLLiAttributes } from 'svelte/elements'
  import Icon from './Icon.svelte'
  import {
    getNavigationTreeContext,
    getNavigationTreeLevel,
    setNavigationTreeLevel,
    type NavigationTreeValue,
  } from './navigationTreeContext'

  type NavigationTreeItemClickEvent = MouseEvent & {
    currentTarget: EventTarget & HTMLLIElement
  }

  export type NavigationTreeItemProps = Omit<
    HTMLLiAttributes,
    | 'aria-current'
    | 'aria-disabled'
    | 'aria-expanded'
    | 'aria-level'
    | 'aria-selected'
    | 'children'
    | 'class'
    | 'onclick'
    | 'role'
    | 'tabindex'
  > & {
    label: string
    value?: NavigationTreeValue
    icon?: string
    children?: Snippet
    class?: string
    disabled?: boolean
    expanded?: boolean
    onexpandedchange?: (expanded: boolean) => void
    onclick?: HTMLLiAttributes['onclick']
  }

  const tree = getNavigationTreeContext()
  if (!tree) {
    throw new Error('NavigationTreeItem must be used inside NavigationTree.')
  }
  const group = tree

  const level = getNavigationTreeLevel()
  setNavigationTreeLevel(level + 1)

  let {
    label,
    value,
    icon,
    children,
    id,
    class: className = '',
    disabled = false,
    expanded = $bindable(false),
    onexpandedchange,
    onclick: userOnclick,
    ...attributes
  }: NavigationTreeItemProps = $props()

  const generatedId = group.createItemId()
  let itemId = $derived(id ?? generatedId)
  let isBranch = $derived(Boolean(children))
  let isSelected = $derived(
    !isBranch && value !== undefined && group.value === value,
  )

  function handleClick(event: NavigationTreeItemClickEvent) {
    const closestItem = (event.target as Element | null)?.closest(
      '.lds-navigation-tree__item',
    )
    if (closestItem !== event.currentTarget) return

    userOnclick?.(event)
    if (event.defaultPrevented || disabled) return

    group.activate(itemId)
    event.currentTarget.focus()

    if (isBranch) {
      expanded = !expanded
      onexpandedchange?.(expanded)
    } else if (value !== undefined) {
      group.select(value)
    }
  }
</script>

<li
  {...attributes}
  id={itemId}
  class={`lds-navigation-tree__item ${className}`}
  role="treeitem"
  aria-current={isSelected ? 'page' : undefined}
  aria-disabled={disabled || undefined}
  aria-expanded={isBranch ? expanded : undefined}
  aria-level={level}
  aria-selected={!isBranch ? isSelected : undefined}
  tabindex={group.activeId === itemId ? 0 : -1}
  data-branch={isBranch || undefined}
  data-label={label}
  data-selected={isSelected || undefined}
  onclick={handleClick}
>
  <span class="lds-navigation-tree__row">
    <span class="lds-navigation-tree__disclosure" aria-hidden="true">
      {#if isBranch}
        <Icon
          name="chevron-right"
          size="var(--lds-navigation-tree-disclosure-size)"
        />
      {/if}
    </span>

    {#if icon}
      <Icon
        name={icon}
        size="var(--lds-navigation-tree-icon-size)"
        class="lds-navigation-tree__icon"
      />
    {/if}

    <span class="lds-navigation-tree__label">{label}</span>
  </span>

  {#if children}
    <div
      class="lds-navigation-tree__group-clip"
      data-open={expanded}
      aria-hidden={!expanded}
      inert={!expanded}
    >
      <ul class="lds-navigation-tree__group" role="group">
        {@render children()}
      </ul>
    </div>
  {/if}
</li>
