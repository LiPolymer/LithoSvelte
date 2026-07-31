import { getContext, setContext } from 'svelte'

export type TabsOrientation = 'horizontal' | 'vertical'
export type TabsValue = string

export type TabsContext = {
  readonly orientation: TabsOrientation
  readonly value: TabsValue | undefined
  getPanelId: (value: TabsValue) => string
  getTabId: (value: TabsValue) => string
  select: (value: TabsValue) => void
}

const TABS_CONTEXT = Symbol.for('litho.tabs')

export function setTabsContext(context: TabsContext) {
  setContext(TABS_CONTEXT, context)
}

export function getTabsContext() {
  return getContext<TabsContext | undefined>(TABS_CONTEXT)
}
