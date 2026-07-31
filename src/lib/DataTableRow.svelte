<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import Checkbox from './Checkbox.svelte'
  import {
    getDataTableContext,
    type DataTableRowRegistration,
    type DataTableValue,
  } from './dataTableContext'

  type DataTableRowClickEvent = MouseEvent & {
    currentTarget: EventTarget & HTMLTableRowElement
  }

  type DataTableRowKeyboardEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLTableRowElement
  }

  type DataTableRowProps = Omit<
    HTMLAttributes<HTMLTableRowElement>,
    'aria-selected' | 'children' | 'class' | 'onclick' | 'onkeydown'
  > & {
    value: DataTableValue
    children: Snippet
    class?: string
    disabled?: boolean
    selectionLabel?: string
    onclick?: HTMLAttributes<HTMLTableRowElement>['onclick']
    onkeydown?: HTMLAttributes<HTMLTableRowElement>['onkeydown']
  }

  const INTERACTIVE_SELECTOR = [
    'a[href]',
    'button',
    'input',
    'label',
    'select',
    'textarea',
    '[contenteditable="true"]',
    '[data-lds-data-table-ignore-row]',
  ].join(',')

  let {
    value,
    children,
    class: className = '',
    disabled = false,
    selectionLabel,
    onclick: userOnclick,
    onkeydown: userOnkeydown,
    ...attributes
  }: DataTableRowProps = $props()

  const dataTable = getDataTableContext()

  if (!dataTable) {
    throw new Error('DataTableRow must be used inside DataTable.')
  }

  const table = dataTable
  let isSelectable = $derived(table.selectionMode === 'multiple')
  let isSelected = $derived(isSelectable && table.isSelected(value))
  let resolvedSelectionLabel = $derived(
    selectionLabel ?? `Select row ${String(value)}`,
  )
  let rootClass = $derived(
    [
      'lds-data-table__row',
      isSelected && 'lds-data-table__row--selected',
      disabled && 'lds-data-table__row--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  )

  const registration: DataTableRowRegistration = {
    get value() {
      return value
    },
    get disabled() {
      return disabled
    },
  }

  function isInteractiveTarget(target: EventTarget | null) {
    return (
      target instanceof Element &&
      Boolean(target.closest(INTERACTIVE_SELECTOR))
    )
  }

  function handleClick(event: DataTableRowClickEvent) {
    userOnclick?.(event)

    if (
      event.defaultPrevented ||
      disabled ||
      !isSelectable ||
      isInteractiveTarget(event.target)
    ) {
      return
    }

    event.currentTarget.focus()
    table.toggle(value)
  }

  function handleKeydown(event: DataTableRowKeyboardEvent) {
    userOnkeydown?.(event)

    if (
      event.defaultPrevented ||
      disabled ||
      !isSelectable ||
      event.target !== event.currentTarget ||
      event.key !== ' '
    ) {
      return
    }

    event.preventDefault()
    table.toggle(value)
  }

  function handleSelectionChange(
    event: Event & { currentTarget: EventTarget & HTMLInputElement },
  ) {
    if (!event.defaultPrevented && !disabled) {
      table.setSelected(value, event.currentTarget.checked)
    }
  }

  onMount(() => table.register(registration))
</script>

<tr
  {...attributes}
  class={rootClass}
  aria-disabled={disabled || undefined}
  aria-selected={isSelectable ? isSelected : undefined}
  data-selected={isSelected || undefined}
  onclick={handleClick}
  onkeydown={handleKeydown}
>
  {#if isSelectable}
    <td class="lds-data-table__selection-cell">
      <Checkbox
        checked={isSelected}
        {disabled}
        tabindex={-1}
        aria-label={resolvedSelectionLabel}
        onclick={(event) => event.stopPropagation()}
        onchange={handleSelectionChange}
      />
    </td>
  {/if}

  {@render children()}
</tr>
