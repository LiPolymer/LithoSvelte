<script lang="ts" module>
  let navigationTreeId = 0
</script>

<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import {
    setNavigationTreeContext,
    setNavigationTreeLevel,
    type NavigationTreeValue,
  } from './navigationTreeContext'

  type NavigationTreeKeyboardEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLUListElement
  }

  type NavigationTreeFocusEvent = FocusEvent & {
    currentTarget: EventTarget & HTMLUListElement
  }

  export type NavigationTreeProps = Omit<
    HTMLAttributes<HTMLUListElement>,
    | 'aria-label'
    | 'aria-multiselectable'
    | 'children'
    | 'class'
    | 'id'
    | 'onfocusin'
    | 'onkeydown'
    | 'role'
  > & {
    children: Snippet
    label: string
    id?: string
    class?: string
    value?: NavigationTreeValue
    loop?: boolean
    onvaluechange?: (value: NavigationTreeValue) => void
    onfocusin?: HTMLAttributes<HTMLUListElement>['onfocusin']
    onkeydown?: HTMLAttributes<HTMLUListElement>['onkeydown']
  }

  const ITEM_SELECTOR = '.lds-navigation-tree__item[role="treeitem"]'

  let {
    children,
    label,
    id = `lds-navigation-tree-${++navigationTreeId}`,
    class: className = '',
    value = $bindable<NavigationTreeValue | undefined>(undefined),
    loop = false,
    onvaluechange,
    onfocusin: userOnfocusin,
    onkeydown: userOnkeydown,
    ...attributes
  }: NavigationTreeProps = $props()

  let treeElement: HTMLUListElement
  let activeId = $state<string>()
  let itemId = 0
  let typeahead = ''
  let typeaheadTimer: ReturnType<typeof setTimeout> | undefined

  setNavigationTreeContext({
    get value() {
      return value
    },
    get activeId() {
      return activeId
    },
    activate(nextId) {
      activeId = nextId
    },
    createItemId() {
      return `${id}-item-${++itemId}`
    },
    select(nextValue) {
      if (value === nextValue) return

      value = nextValue
      onvaluechange?.(nextValue)
    },
  })
  setNavigationTreeLevel(1)

  function getItems() {
    return Array.from(
      treeElement.querySelectorAll<HTMLLIElement>(ITEM_SELECTOR),
    ).filter(
      (item) =>
        item.closest('[role="tree"]') === treeElement &&
        item.getAttribute('aria-disabled') !== 'true' &&
        !item.closest('[hidden]') &&
        !item.closest('[inert]'),
    )
  }

  function resolveItem(target: EventTarget | null) {
    const item =
      target instanceof Element
        ? target.closest<HTMLLIElement>(ITEM_SELECTOR)
        : null

    return item?.closest('[role="tree"]') === treeElement ? item : null
  }

  function setActiveItem(item: HTMLLIElement, focus = false) {
    if (!getItems().includes(item)) return

    activeId = item.id
    if (focus) item.focus()
  }

  function syncTabStop() {
    const items = getItems()
    if (items.length === 0) {
      activeId = undefined
      return
    }

    const activeItem = activeId
      ? items.find((item) => item.id === activeId)
      : undefined
    const nextActive =
      activeItem ??
      items.find((item) => item.getAttribute('aria-selected') === 'true') ??
      items[0]

    activeId = nextActive.id
  }

  function moveToItem(item: HTMLLIElement | undefined) {
    if (!item) return

    setActiveItem(item, true)
  }

  function toggleBranch(item: HTMLLIElement) {
    item.click()
  }

  function handleFocusin(event: NavigationTreeFocusEvent) {
    userOnfocusin?.(event)
    if (event.defaultPrevented) return

    const item = resolveItem(event.target)
    if (item) setActiveItem(item)
  }

  function handleTypeahead(
    event: NavigationTreeKeyboardEvent,
    item: HTMLLIElement,
  ) {
    if (
      event.key.length !== 1 ||
      event.key === ' ' ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return false
    }

    typeahead += event.key.toLocaleLowerCase()
    if (typeaheadTimer) clearTimeout(typeaheadTimer)
    typeaheadTimer = setTimeout(() => {
      typeahead = ''
    }, 500)

    const items = getItems()
    const currentIndex = items.indexOf(item)
    const orderedItems = [
      ...items.slice(currentIndex + 1),
      ...items.slice(0, currentIndex + 1),
    ]
    const match = orderedItems.find((candidate) =>
      candidate.dataset.label?.toLocaleLowerCase().startsWith(typeahead),
    )

    if (match) {
      event.preventDefault()
      moveToItem(match)
    }

    return true
  }

  function handleKeydown(event: NavigationTreeKeyboardEvent) {
    userOnkeydown?.(event)
    if (event.defaultPrevented) return

    const item = resolveItem(event.target)
    if (!item) return

    if (handleTypeahead(event, item)) return

    const items = getItems()
    const currentIndex = items.indexOf(item)
    if (currentIndex === -1) return

    const isRtl = getComputedStyle(treeElement).direction === 'rtl'
    const expandKey = isRtl ? 'ArrowLeft' : 'ArrowRight'
    const collapseKey = isRtl ? 'ArrowRight' : 'ArrowLeft'

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const direction = event.key === 'ArrowUp' ? -1 : 1
      let nextIndex = currentIndex + direction

      if (loop) {
        nextIndex = (nextIndex + items.length) % items.length
      } else {
        nextIndex = Math.min(Math.max(nextIndex, 0), items.length - 1)
      }

      event.preventDefault()
      moveToItem(items[nextIndex])
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      moveToItem(event.key === 'Home' ? items[0] : items.at(-1))
      return
    }

    if (event.key === expandKey) {
      const expanded = item.getAttribute('aria-expanded')

      if (expanded === 'false') {
        event.preventDefault()
        toggleBranch(item)
      } else if (expanded === 'true') {
        const child = item.querySelector<HTMLLIElement>(
          ':scope > [role="group"] > [role="treeitem"]',
        )

        if (child && child.getAttribute('aria-disabled') !== 'true') {
          event.preventDefault()
          moveToItem(child)
        }
      }
      return
    }

    if (event.key === collapseKey) {
      if (item.getAttribute('aria-expanded') === 'true') {
        event.preventDefault()
        toggleBranch(item)
        return
      }

      const parent = item.parentElement?.closest<HTMLLIElement>(ITEM_SELECTOR)
      if (parent) {
        event.preventDefault()
        moveToItem(parent)
      }
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      item.click()
    }
  }

  onMount(() => {
    syncTabStop()

    const observer = new MutationObserver(syncTabStop)
    observer.observe(treeElement, {
      attributes: true,
      attributeFilter: [
        'aria-disabled',
        'aria-expanded',
        'aria-selected',
        'hidden',
        'inert',
      ],
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
      if (typeaheadTimer) clearTimeout(typeaheadTimer)
    }
  })
</script>

<ul
  bind:this={treeElement}
  {...attributes}
  {id}
  class={`lds-navigation-tree ${className}`}
  role="tree"
  aria-label={label}
  aria-multiselectable="false"
  onfocusin={handleFocusin}
  onkeydown={handleKeydown}
>
  {@render children()}
</ul>
