<script lang="ts" module>
  let tabsId = 0
</script>

<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import {
    setTabsContext,
    type TabsOrientation,
    type TabsValue,
  } from './tabsContext'

  type TabsKeyboardEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLDivElement
  }

  export type TabsProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'class' | 'id' | 'onkeydown'
  > & {
    tabs: Snippet
    children?: Snippet
    label: string
    id?: string
    class?: string
    value?: TabsValue
    orientation?: TabsOrientation
    loop?: boolean
    onvaluechange?: (value: TabsValue) => void
    onkeydown?: HTMLAttributes<HTMLDivElement>['onkeydown']
  }

  let {
    tabs,
    children,
    label,
    id = `lds-tabs-${++tabsId}`,
    class: className = '',
    value = $bindable<TabsValue | undefined>(undefined),
    orientation = 'horizontal',
    loop = true,
    onvaluechange,
    onkeydown: userOnkeydown,
    ...attributes
  }: TabsProps = $props()

  let rootElement: HTMLDivElement
  let tabListElement: HTMLDivElement

  function valueId(nextValue: TabsValue) {
    return encodeURIComponent(nextValue).replaceAll('%', '-')
  }

  function select(nextValue: TabsValue, notify = true) {
    if (value === nextValue) return

    value = nextValue
    if (notify) onvaluechange?.(nextValue)
  }

  setTabsContext({
    get orientation() {
      return orientation
    },
    get value() {
      return value
    },
    getPanelId(nextValue) {
      return `${id}-panel-${valueId(nextValue)}`
    },
    getTabId(nextValue) {
      return `${id}-tab-${valueId(nextValue)}`
    },
    select,
  })

  function getTabs() {
    return Array.from(
      tabListElement.querySelectorAll<HTMLButtonElement>(
        ':scope > [role="tab"]:not(:disabled)',
      ),
    ).filter((tab) => !tab.hidden && tab.getAttribute('aria-hidden') !== 'true')
  }

  function handleKeydown(event: TabsKeyboardEvent) {
    userOnkeydown?.(event)
    if (event.defaultPrevented) return

    const tab = (event.target as Element | null)?.closest<HTMLButtonElement>(
      '[role="tab"]',
    )
    if (!tab || tab.closest('[role="tablist"]') !== tabListElement) return

    const previousKey =
      orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
    const nextKey =
      orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'
    const isDirectional =
      event.key === previousKey || event.key === nextKey
    const isBoundary = event.key === 'Home' || event.key === 'End'
    if (!isDirectional && !isBoundary) return

    const items = getTabs()
    const currentIndex = items.indexOf(tab)
    if (currentIndex === -1 || items.length === 0) return

    let nextIndex: number
    if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = items.length - 1
    } else {
      let direction = event.key === previousKey ? -1 : 1

      if (
        orientation === 'horizontal' &&
        getComputedStyle(tabListElement).direction === 'rtl'
      ) {
        direction *= -1
      }

      nextIndex = currentIndex + direction
      if (loop) {
        nextIndex = (nextIndex + items.length) % items.length
      } else {
        nextIndex = Math.min(Math.max(nextIndex, 0), items.length - 1)
      }
    }

    const nextTab = items[nextIndex]
    const nextValue = nextTab.dataset.value
    if (nextValue === undefined) return

    event.preventDefault()
    select(nextValue)
    nextTab.focus()
  }

  onMount(() => {
    const items = getTabs()
    const selected = items.find(
      (tab) => tab.getAttribute('aria-selected') === 'true',
    )

    if (!selected && items[0]?.dataset.value !== undefined) {
      select(items[0].dataset.value, false)
    }
  })
</script>

<div
  bind:this={rootElement}
  {...attributes}
  {id}
  class={`lds-tabs lds-tabs--${orientation} ${className}`}
  data-orientation={orientation}
  onkeydown={handleKeydown}
>
  <div
    bind:this={tabListElement}
    class="lds-tabs__list"
    role="tablist"
    aria-label={label}
    aria-orientation={orientation}
  >
    {@render tabs()}
  </div>

  <div class="lds-tabs__panels">
    {@render children?.()}
  </div>
</div>
