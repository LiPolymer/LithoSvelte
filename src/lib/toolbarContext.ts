import { getContext } from 'svelte'

export type ToolbarOrientation = 'horizontal' | 'vertical'

export type ToolbarContext = {
  readonly orientation: ToolbarOrientation
}

export const toolbarContextKey = Symbol('lds-toolbar')

export function getToolbarContext() {
  return getContext<ToolbarContext | undefined>(toolbarContextKey)
}
