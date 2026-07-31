<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { getTabsContext, type TabsValue } from './tabsContext'

  export type TabPanelProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    | 'aria-labelledby'
    | 'children'
    | 'class'
    | 'hidden'
    | 'id'
    | 'role'
  > & {
    children: Snippet
    value: TabsValue
    class?: string
  }

  let {
    children,
    value,
    class: className = '',
    ...attributes
  }: TabPanelProps = $props()

  const tabs = getTabsContext()
  if (!tabs) throw new Error('TabPanel must be used inside Tabs.')
  const group = tabs

  let isSelected = $derived(group.value === value)
</script>

<div
  {...attributes}
  id={group.getPanelId(value)}
  class={`lds-tab-panel ${className}`}
  role="tabpanel"
  aria-labelledby={group.getTabId(value)}
  hidden={!isSelected}
  tabindex="0"
>
  {@render children()}
</div>
