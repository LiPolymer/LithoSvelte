<script lang="ts">
  import { onMount, setContext, type Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import {
    toolbarContextKey,
    type ToolbarContext,
    type ToolbarOrientation,
  } from './toolbarContext'

  type ToolbarKeyboardEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLDivElement
  }

  type ToolbarFocusEvent = FocusEvent & {
    currentTarget: EventTarget & HTMLDivElement
  }

  type ToolbarProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    'aria-orientation' | 'children' | 'class' | 'onfocusin' | 'onkeydown' | 'role'
  > & {
    children?: Snippet
    class?: string
    orientation?: ToolbarOrientation
    loop?: boolean
    onfocusin?: HTMLAttributes<HTMLDivElement>['onfocusin']
    onkeydown?: HTMLAttributes<HTMLDivElement>['onkeydown']
  }

  const ITEM_SELECTOR = [
    'button:not(:disabled)',
    'a[href]',
    'input:not(:disabled)',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    '[tabindex]:not([disabled])',
  ].join(',')

  let {
    children,
    class: className = '',
    orientation = 'horizontal',
    loop = true,
    onfocusin: userOnfocusin,
    onkeydown: userOnkeydown,
    ...attributes
  }: ToolbarProps = $props()

  let toolbarElement: HTMLDivElement
  let activeItem: HTMLElement | null = null
  const originalTabIndexes = new Map<HTMLElement, string | null>()

  const context: ToolbarContext = {
    get orientation() {
      return orientation
    },
  }

  setContext(toolbarContextKey, context)

  function getItems() {
    return Array.from(
      toolbarElement.querySelectorAll<HTMLElement>(ITEM_SELECTOR),
    ).filter((item) => {
      const originalTabIndex = originalTabIndexes.has(item)
        ? originalTabIndexes.get(item)
        : item.getAttribute('tabindex')

      return (
        item.closest<HTMLElement>('[role="toolbar"]') === toolbarElement &&
        !item.hidden &&
        item.getAttribute('aria-hidden') !== 'true' &&
        originalTabIndex !== '-1'
      )
    })
  }

  function rememberTabIndex(item: HTMLElement) {
    if (!originalTabIndexes.has(item)) {
      originalTabIndexes.set(item, item.getAttribute('tabindex'))
    }
  }

  function setActiveItem(item: HTMLElement, focus = false) {
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
        : items.find((item) => item.tabIndex === 0) ?? items[0]

    setActiveItem(nextActive)
  }

  function handleFocusin(event: ToolbarFocusEvent) {
    userOnfocusin?.(event)
    if (event.defaultPrevented) return

    const focusedItem = (event.target as Element | null)?.closest<HTMLElement>(
      ITEM_SELECTOR,
    )

    if (focusedItem) setActiveItem(focusedItem)
  }

  function handleKeydown(event: ToolbarKeyboardEvent) {
    userOnkeydown?.(event)
    if (event.defaultPrevented) return

    const isPreviousKey =
      event.key === (orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp')
    const isNextKey =
      event.key === (orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown')
    const isBoundaryKey = event.key === 'Home' || event.key === 'End'

    if (!isPreviousKey && !isNextKey && !isBoundaryKey) return

    const items = getItems()
    const currentItem = (event.target as Element | null)?.closest<HTMLElement>(
      ITEM_SELECTOR,
    )
    const currentIndex = currentItem ? items.indexOf(currentItem) : -1

    if (items.length === 0 || currentIndex === -1) return

    let nextIndex: number

    if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = items.length - 1
    } else {
      let direction = isPreviousKey ? -1 : 1

      if (
        orientation === 'horizontal' &&
        getComputedStyle(event.currentTarget).direction === 'rtl'
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

    event.preventDefault()
    setActiveItem(items[nextIndex], true)
  }

  onMount(() => {
    syncTabStops()

    const observer = new MutationObserver(syncTabStops)
    observer.observe(toolbarElement, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'disabled', 'hidden'],
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

<div
  bind:this={toolbarElement}
  {...attributes}
  class={`lds-toolbar lds-toolbar--${orientation} ${className}`}
  role="toolbar"
  aria-orientation={orientation}
  data-orientation={orientation}
  onfocusin={handleFocusin}
  onkeydown={handleKeydown}
>
  {@render children?.()}
</div>
