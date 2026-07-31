<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import {
    setListContext,
    type ListSelectionMode,
    type ListValue,
  } from './listContext'

  type ListKeyboardEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLUListElement
  }

  type ListFocusEvent = FocusEvent & {
    currentTarget: EventTarget & HTMLUListElement
  }

  export type ListProps = Omit<
    HTMLAttributes<HTMLUListElement>,
    'children' | 'class' | 'onfocusin' | 'onkeydown'
  > & {
    children: Snippet
    class?: string
    selectionMode?: ListSelectionMode
    value?: ListValue
    loop?: boolean
    onvaluechange?: (value: ListValue) => void
    onfocusin?: HTMLAttributes<HTMLUListElement>['onfocusin']
    onkeydown?: HTMLAttributes<HTMLUListElement>['onkeydown']
  }

  const ITEM_SELECTOR =
    ':scope > .lds-list__item > .lds-list-item__trigger:not(:disabled)'

  let {
    children,
    class: className = '',
    selectionMode = 'none',
    value = $bindable<ListValue | undefined>(undefined),
    loop = true,
    onvaluechange,
    onfocusin: userOnfocusin,
    onkeydown: userOnkeydown,
    ...attributes
  }: ListProps = $props()

  let listElement: HTMLUListElement
  let activeItem: HTMLButtonElement | null = null
  const originalTabIndexes = new Map<HTMLButtonElement, string | null>()

  setListContext({
    get selectionMode() {
      return selectionMode
    },
    get value() {
      return value
    },
    select(nextValue) {
      if (selectionMode !== 'single' || value === nextValue) return

      value = nextValue
      onvaluechange?.(nextValue)
    },
  })

  function getItems() {
    return Array.from(
      listElement.querySelectorAll<HTMLButtonElement>(ITEM_SELECTOR),
    ).filter((item) => {
      const originalTabIndex = originalTabIndexes.has(item)
        ? originalTabIndexes.get(item)
        : item.getAttribute('tabindex')

      return (
        item.closest<HTMLUListElement>('.lds-list') === listElement &&
        !item.hidden &&
        item.getAttribute('aria-hidden') !== 'true' &&
        originalTabIndex !== '-1'
      )
    })
  }

  function rememberTabIndex(item: HTMLButtonElement) {
    if (!originalTabIndexes.has(item)) {
      originalTabIndexes.set(item, item.getAttribute('tabindex'))
    }
  }

  function setActiveItem(item: HTMLButtonElement, focus = false) {
    const items = getItems()
    if (!items.includes(item)) return

    for (const candidate of items) {
      rememberTabIndex(candidate)
      candidate.tabIndex = candidate === item ? 0 : -1
    }

    activeItem = item
    if (focus) item.focus()
  }

  function syncTabStops() {
    const items = getItems()

    if (items.length === 0) {
      activeItem = null
      return
    }

    const nextActive =
      activeItem && items.includes(activeItem)
        ? activeItem
        : items.find((item) => item.getAttribute('aria-pressed') === 'true') ??
          items[0]

    setActiveItem(nextActive)
  }

  function resolveItem(target: EventTarget | null) {
    const item =
      target instanceof Element
        ? target.closest<HTMLButtonElement>('.lds-list-item__trigger')
        : null

    return item?.closest<HTMLUListElement>('.lds-list') === listElement
      ? item
      : null
  }

  function handleFocusin(event: ListFocusEvent) {
    userOnfocusin?.(event)
    if (event.defaultPrevented) return

    const focusedItem = resolveItem(event.target)
    if (focusedItem) setActiveItem(focusedItem)
  }

  function handleKeydown(event: ListKeyboardEvent) {
    userOnkeydown?.(event)
    if (
      event.defaultPrevented ||
      !['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)
    ) {
      return
    }

    const currentItem = resolveItem(event.target)
    if (!currentItem) return

    const items = getItems()
    const currentIndex = items.indexOf(currentItem)
    if (items.length === 0 || currentIndex === -1) return

    let nextIndex: number

    if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = items.length - 1
    } else {
      const direction = event.key === 'ArrowUp' ? -1 : 1
      nextIndex = currentIndex + direction

      if (loop) {
        nextIndex = (nextIndex + items.length) % items.length
      } else {
        nextIndex = Math.min(Math.max(nextIndex, 0), items.length - 1)
      }
    }

    event.preventDefault()
    setActiveItem(items[nextIndex], true)
  }

  onMount(() => {
    syncTabStops()

    const observer = new MutationObserver(syncTabStops)
    observer.observe(listElement, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'aria-pressed', 'disabled', 'hidden'],
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()

      for (const [item, originalTabIndex] of originalTabIndexes) {
        if (originalTabIndex === null) {
          item.removeAttribute('tabindex')
        } else {
          item.setAttribute('tabindex', originalTabIndex)
        }
      }
    }
  })
</script>

<ul
  bind:this={listElement}
  {...attributes}
  class={`lds-list lds-list--${selectionMode} ${className}`}
  data-selection-mode={selectionMode}
  onfocusin={handleFocusin}
  onkeydown={handleKeydown}
>
  {@render children()}
</ul>
