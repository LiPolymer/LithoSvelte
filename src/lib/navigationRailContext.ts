import { getContext, setContext } from 'svelte'

export type NavigationRailValue = string | number

export type NavigationRailContext = {
  readonly value: NavigationRailValue | undefined
  readonly activeId: string | undefined
  readonly expanded: boolean
  activate: (id: string) => void
  createItemId: () => string
  select: (value: NavigationRailValue) => void
}

const NAVIGATION_RAIL_CONTEXT = Symbol.for('litho.navigation-rail')

export function setNavigationRailContext(context: NavigationRailContext) {
  setContext(NAVIGATION_RAIL_CONTEXT, context)
}

export function getNavigationRailContext() {
  return getContext<NavigationRailContext | undefined>(
    NAVIGATION_RAIL_CONTEXT,
  )
}
