<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import { getListContext, type ListValue } from './listContext'

  type ListItemClickEvent = MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement
  }

  type ListItemProps = Omit<
    HTMLButtonAttributes,
    | 'aria-pressed'
    | 'children'
    | 'class'
    | 'disabled'
    | 'onclick'
    | 'type'
    | 'value'
  > & {
    value: ListValue
    label: string
    description?: string
    metadata?: string
    leading?: Snippet
    actions?: Snippet
    class?: string
    disabled?: boolean
    onclick?: HTMLButtonAttributes['onclick']
  }

  let {
    value,
    label,
    description,
    metadata,
    leading,
    actions,
    class: className = '',
    disabled = false,
    onclick: userOnclick,
    ...attributes
  }: ListItemProps = $props()

  const list = getListContext()

  if (!list) {
    throw new Error('ListItem must be used inside List.')
  }

  const group = list

  let isSelectable = $derived(group.selectionMode === 'single')
  let isSelected = $derived(isSelectable && group.value === value)
  let hasLeading = $derived(Boolean(leading))
  let hasActions = $derived(Boolean(actions) && !disabled)
  let rootClass = $derived(
    [
      'lds-list__item',
      isSelected && 'lds-list__item--selected',
      disabled && 'lds-list__item--disabled',
      hasLeading && 'lds-list__item--has-leading',
      hasActions && 'lds-list__item--has-actions',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  )

  function handleClick(event: ListItemClickEvent) {
    userOnclick?.(event)

    if (!event.defaultPrevented && !event.currentTarget.disabled) {
      group.select(value)
    }
  }
</script>

<li class={rootClass} data-selected={isSelected || undefined}>
  <button
    {...attributes}
    class="lds-list-item__trigger"
    type="button"
    {disabled}
    aria-pressed={isSelectable ? isSelected : undefined}
    onclick={handleClick}
  >
    {#if leading}
      <span class="lds-list-item__leading" aria-hidden="true">
        {@render leading()}
      </span>
    {/if}

    <span class="lds-list-item__content">
      <span class="lds-list-item__label">{label}</span>
      {#if description}
        <span class="lds-list-item__description">{description}</span>
      {/if}
    </span>

    {#if metadata}
      <span class="lds-list-item__metadata">{metadata}</span>
    {/if}
  </button>

  {#if hasActions}
    <div class="lds-list-item__actions">
      {@render actions?.()}
    </div>
  {/if}
</li>
