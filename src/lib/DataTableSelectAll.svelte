<script lang="ts">
  import type { HTMLThAttributes } from 'svelte/elements'
  import Checkbox from './Checkbox.svelte'
  import { getDataTableContext } from './dataTableContext'

  export type DataTableSelectAllProps = Omit<
    HTMLThAttributes,
    'children' | 'class' | 'scope'
  > & {
    label?: string
    class?: string
  }

  let {
    label = 'Select all rows',
    class: className = '',
    ...attributes
  }: DataTableSelectAllProps = $props()

  const dataTable = getDataTableContext()

  if (!dataTable || dataTable.selectionMode !== 'multiple') {
    throw new Error(
      'DataTableSelectAll requires DataTable selectionMode="multiple".',
    )
  }

  const table = dataTable
  let checked = $derived(table.allRowsSelected)
  let indeterminate = $derived(table.someRowsSelected)

  function handleChange(
    event: Event & { currentTarget: EventTarget & HTMLInputElement },
  ) {
    if (!event.defaultPrevented) {
      table.setAll(event.currentTarget.checked)
    }
  }
</script>

<th
  {...attributes}
  class={`lds-data-table__selection-header ${className}`}
  scope="col"
>
  <Checkbox
    {checked}
    {indeterminate}
    aria-label={label}
    onchange={handleChange}
  />
</th>
