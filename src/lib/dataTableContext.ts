import { getContext, setContext } from 'svelte'

export type DataTableSelectionMode = 'none' | 'multiple'
export type DataTableValue = string | number

export type DataTableRowRegistration = {
  readonly value: DataTableValue
  readonly disabled: boolean
}

export type DataTableContext = {
  readonly selectionMode: DataTableSelectionMode
  readonly selected: readonly DataTableValue[]
  readonly allRowsSelected: boolean
  readonly someRowsSelected: boolean
  isSelected: (value: DataTableValue) => boolean
  setSelected: (value: DataTableValue, selected: boolean) => void
  toggle: (value: DataTableValue) => void
  setAll: (selected: boolean) => void
  register: (row: DataTableRowRegistration) => () => void
}

const DATA_TABLE_CONTEXT = Symbol.for('litho.data-table')

export function setDataTableContext(context: DataTableContext) {
  setContext(DATA_TABLE_CONTEXT, context)
}

export function getDataTableContext() {
  return getContext<DataTableContext | undefined>(DATA_TABLE_CONTEXT)
}
