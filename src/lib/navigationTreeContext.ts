import { getContext, setContext } from 'svelte'

export type NavigationTreeValue = string | number

export type NavigationTreeContext = {
  readonly value: NavigationTreeValue | undefined
  readonly activeId: string | undefined
  activate: (id: string) => void
  createItemId: () => string
  select: (value: NavigationTreeValue) => void
}

const NAVIGATION_TREE_CONTEXT = Symbol.for('litho.navigation-tree')
const NAVIGATION_TREE_LEVEL_CONTEXT = Symbol.for(
  'litho.navigation-tree-level',
)

export function setNavigationTreeContext(context: NavigationTreeContext) {
  setContext(NAVIGATION_TREE_CONTEXT, context)
}

export function getNavigationTreeContext() {
  return getContext<NavigationTreeContext | undefined>(
    NAVIGATION_TREE_CONTEXT,
  )
}

export function setNavigationTreeLevel(level: number) {
  setContext(NAVIGATION_TREE_LEVEL_CONTEXT, level)
}

export function getNavigationTreeLevel() {
  return getContext<number | undefined>(NAVIGATION_TREE_LEVEL_CONTEXT) ?? 1
}
