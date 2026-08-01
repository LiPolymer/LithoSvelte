<script lang="ts" module>
  let navigationRailId = 0
</script>

<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import Icon from './Icon.svelte'
  import Tooltip from './Tooltip.svelte'
  import {
    setNavigationRailLevel,
    setNavigationRailContext,
    type NavigationRailValue,
  } from './navigationRailContext'

  type NavigationRailKeyboardEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLElement
  }

  type NavigationRailFocusEvent = FocusEvent & {
    currentTarget: EventTarget & HTMLElement
  }

  export type NavigationRailProps = Omit<
    HTMLAttributes<HTMLElement>,
    'aria-label' | 'children' | 'class' | 'id' | 'onfocusin' | 'onkeydown'
  > & {
    children: Snippet
    label: string
    id?: string
    class?: string
    value?: NavigationRailValue
    expanded?: boolean
    loop?: boolean
    showToggle?: boolean
    expandLabel?: string
    collapseLabel?: string
    onvaluechange?: (value: NavigationRailValue) => void
    onexpandedchange?: (expanded: boolean) => void
    onfocusin?: HTMLAttributes<HTMLElement>['onfocusin']
    onkeydown?: HTMLAttributes<HTMLElement>['onkeydown']
  }

  const ITEM_SELECTOR = '.lds-navigation-rail__item:not(:disabled)'

  let {
    children,
    label,
    id = `lds-navigation-rail-${++navigationRailId}`,
    class: className = '',
    value = $bindable<NavigationRailValue | undefined>(undefined),
    expanded = $bindable(false),
    loop = true,
    showToggle = true,
    expandLabel = 'Expand navigation',
    collapseLabel = 'Collapse navigation',
    onvaluechange,
    onexpandedchange,
    onfocusin: userOnfocusin,
    onkeydown: userOnkeydown,
    ...attributes
  }: NavigationRailProps = $props()

  let railElement: HTMLElement
  let activeId = $state<string>()
  let itemId = 0
  let typeahead = ''
  let typeaheadTimer: ReturnType<typeof setTimeout> | undefined

  setNavigationRailContext({
    get value() {
      return value
    },
    get activeId() {
      return activeId
    },
    get expanded() {
      return expanded
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
  setNavigationRailLevel(1)

  function setExpanded(nextExpanded: boolean) {
    if (expanded === nextExpanded) return

    expanded = nextExpanded
    onexpandedchange?.(expanded)
  }

  function toggleExpanded() {
    setExpanded(!expanded)
  }

  function getAllItems() {
    return Array.from(
      railElement.querySelectorAll<HTMLButtonElement>(
        '.lds-navigation-rail__item',
      ),
    ).filter(
      (item) => item.closest('.lds-navigation-rail') === railElement,
    )
  }

  function getItems() {
    return Array.from(
      railElement.querySelectorAll<HTMLButtonElement>(ITEM_SELECTOR),
    ).filter(
      (item) =>
        item.closest('.lds-navigation-rail') === railElement &&
        !item.closest('[hidden]') &&
        !item.closest('[inert]'),
    )
  }

  function resolveItem(target: EventTarget | null) {
    const item =
      target instanceof Element
        ? target.closest<HTMLButtonElement>(ITEM_SELECTOR)
        : null

    return item?.closest('.lds-navigation-rail') === railElement
      ? item
      : null
  }

  function getParentItem(item: HTMLButtonElement) {
    const entry = item.closest<HTMLLIElement>(
      '.lds-navigation-rail__entry',
    )
    const parentEntry = entry?.parentElement?.closest<HTMLLIElement>(
      '.lds-navigation-rail__entry',
    )

    return (
      parentEntry?.querySelector<HTMLButtonElement>(
        ':scope > .lds-navigation-rail__row .lds-navigation-rail__item',
      ) ?? undefined
    )
  }

  function getFirstChild(item: HTMLButtonElement) {
    const entry = item.closest<HTMLLIElement>(
      '.lds-navigation-rail__entry',
    )

    return (
      entry?.querySelector<HTMLButtonElement>(
        ':scope > .lds-navigation-rail__group-clip > .lds-navigation-rail__group > .lds-navigation-rail__entry > .lds-navigation-rail__row .lds-navigation-rail__item:not(:disabled)',
      ) ?? undefined
    )
  }

  function resolveVisibleItem(
    item: HTMLButtonElement | undefined,
    visibleItems: HTMLButtonElement[],
  ) {
    let candidate = item

    while (candidate && !visibleItems.includes(candidate)) {
      candidate = getParentItem(candidate)
    }

    return candidate
  }

  function toggleBranch(item: HTMLButtonElement) {
    const entry = item.closest<HTMLLIElement>(
      '.lds-navigation-rail__entry',
    )
    entry
      ?.querySelector<HTMLButtonElement>(
        ':scope > .lds-navigation-rail__row > .lds-navigation-rail__disclosure',
      )
      ?.click()
  }

  function setActiveItem(item: HTMLButtonElement, focus = false) {
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

    const allItems = getAllItems()
    const activeItem = resolveVisibleItem(
      activeId
        ? allItems.find((item) => item.id === activeId)
        : undefined,
      items,
    )
    const selectedItem = resolveVisibleItem(
      allItems.find((item) => item.getAttribute('aria-current') === 'page'),
      items,
    )
    const nextActive =
      activeItem ??
      selectedItem ??
      items[0]

    activeId = nextActive.id
  }

  function moveToItem(item: HTMLButtonElement | undefined) {
    if (item) setActiveItem(item, true)
  }

  function handleTypeahead(
    event: NavigationRailKeyboardEvent,
    item: HTMLButtonElement,
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

  function handleFocusin(event: NavigationRailFocusEvent) {
    userOnfocusin?.(event)
    if (event.defaultPrevented) return

    const item = resolveItem(event.target)
    if (item) setActiveItem(item)
  }

  function handleKeydown(event: NavigationRailKeyboardEvent) {
    userOnkeydown?.(event)
    if (event.defaultPrevented) return

    const item = resolveItem(event.target)
    if (!item || handleTypeahead(event, item)) return

    const items = getItems()
    const currentIndex = items.indexOf(item)
    if (currentIndex === -1) return

    const isRtl = getComputedStyle(railElement).direction === 'rtl'
    const expandKey = isRtl ? 'ArrowLeft' : 'ArrowRight'
    const collapseKey = isRtl ? 'ArrowRight' : 'ArrowLeft'

    if (event.key === expandKey) {
      event.preventDefault()

      if (!expanded) {
        setExpanded(true)
        return
      }

      const branchExpanded = item.getAttribute('aria-expanded')
      if (branchExpanded === 'false') {
        toggleBranch(item)
      } else if (branchExpanded === 'true') {
        moveToItem(getFirstChild(item))
      }
      return
    }

    if (event.key === collapseKey && expanded) {
      const branchExpanded = item.getAttribute('aria-expanded')
      if (branchExpanded === 'true') {
        event.preventDefault()
        toggleBranch(item)
        return
      }

      const parent = getParentItem(item)
      event.preventDefault()
      if (parent) {
        moveToItem(parent)
      } else {
        setExpanded(false)
      }
      return
    }

    let nextIndex: number | undefined

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const direction = event.key === 'ArrowUp' ? -1 : 1
      nextIndex = currentIndex + direction

      if (loop) {
        nextIndex = (nextIndex + items.length) % items.length
      } else {
        nextIndex = Math.min(Math.max(nextIndex, 0), items.length - 1)
      }
    } else if (event.key === 'Home' || event.key === 'End') {
      nextIndex = event.key === 'Home' ? 0 : items.length - 1
    }

    if (nextIndex === undefined) return

    event.preventDefault()
    moveToItem(items[nextIndex])
  }

  onMount(() => {
    syncTabStop()

    const observer = new MutationObserver(syncTabStop)
    observer.observe(railElement, {
      attributes: true,
      attributeFilter: [
        'aria-current',
        'aria-expanded',
        'disabled',
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

<nav
  bind:this={railElement}
  {...attributes}
  {id}
  class={`lds-navigation-rail ${className}`}
  aria-label={label}
  data-expanded={expanded}
  onfocusin={handleFocusin}
  onkeydown={handleKeydown}
>
  {#if showToggle}
    <Tooltip
      content={expandLabel}
      placement="right"
      delay={350}
      disabled={expanded}
    >
      <button
        class="lds-navigation-rail__toggle"
        type="button"
        aria-label={expanded ? collapseLabel : expandLabel}
        aria-expanded={expanded}
        data-expanded={expanded}
        onclick={toggleExpanded}
      >
        <Icon
          name="chevron-right"
          size="var(--lds-navigation-rail-toggle-icon-size)"
        />
        <span class="lds-navigation-rail__label" aria-hidden="true">
          {collapseLabel}
        </span>
      </button>
    </Tooltip>
  {/if}

  <ul class="lds-navigation-rail__list">
    {@render children()}
  </ul>
</nav>
