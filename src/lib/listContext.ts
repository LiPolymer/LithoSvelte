import { getContext, setContext } from 'svelte'

export type ListSelectionMode = 'none' | 'single'
export type ListValue = string | number

export type ListContext = {
  readonly selectionMode: ListSelectionMode
  readonly value: ListValue | undefined
  select: (value: ListValue) => void
}

const LIST_CONTEXT = Symbol.for('litho.list')

export function setListContext(context: ListContext) {
  setContext(LIST_CONTEXT, context)
}

export function getListContext() {
  return getContext<ListContext | undefined>(LIST_CONTEXT)
}
