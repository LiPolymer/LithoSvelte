<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import type { HTMLTableAttributes } from 'svelte/elements'
  import {
    setDataTableContext,
    type DataTableRowRegistration,
    type DataTableSelectionMode,
    type DataTableValue,
  } from './dataTableContext'

  type DataTableKeyboardEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLTableElement
  }

  type DataTableFocusEvent = FocusEvent & {
    currentTarget: EventTarget & HTMLTableElement
  }

  type DataTableProps = Omit<
    HTMLTableAttributes,
    | 'children'
    | 'class'
    | 'onfocusin'
    | 'onkeydown'
    | 'onselectionchange'
  > & {
    children: Snippet
    class?: string
    viewportClass?: string
    caption?: string
    selectionMode?: DataTableSelectionMode
    selected?: DataTableValue[]
    stickyHeader?: boolean
    loop?: boolean
    onselectionchange?: (selected: readonly DataTableValue[]) => void
    onfocusin?: HTMLTableAttributes['onfocusin']
    onkeydown?: HTMLTableAttributes['onkeydown']
  }

  const ROW_SELECTOR =
    ':scope > tbody > .lds-data-table__row:not([aria-disabled="true"])'

  let {
    children,
    class: className = '',
    viewportClass = '',
    caption,
    selectionMode = 'none',
    selected = $bindable<DataTableValue[]>([]),
    stickyHeader = true,
    loop = true,
    onselectionchange,
    onfocusin: userOnfocusin,
    onkeydown: userOnkeydown,
    ...attributes
  }: DataTableProps = $props()

  let tableElement: HTMLTableElement
  let activeRow: HTMLTableRowElement | null = null
  let rows = $state<DataTableRowRegistration[]>([])
  const originalTabIndexes = new Map<HTMLTableRowElement, string | null>()

  function isSelected(value: DataTableValue) {
    return selected.includes(value)
  }

  function commitSelection(nextSelected: DataTableValue[]) {
    selected = nextSelected
    onselectionchange?.(nextSelected)
  }

  function setSelected(value: DataTableValue, nextState: boolean) {
    if (selectionMode !== 'multiple' || isSelected(value) === nextState) return

    commitSelection(
      nextState
        ? [...selected, value]
        : selected.filter((candidate) => candidate !== value),
    )
  }

  function getEnabledValues() {
    return Array.from(
      new Set(
        rows
          .filter((row) => !row.disabled)
          .map((row) => row.value),
      ),
    )
  }

  setDataTableContext({
    get selectionMode() {
      return selectionMode
    },
    get selected() {
      return selected
    },
    get allRowsSelected() {
      const enabledValues = getEnabledValues()
      return (
        enabledValues.length > 0 &&
        enabledValues.every((value) => isSelected(value))
      )
    },
    get someRowsSelected() {
      const enabledValues = getEnabledValues()
      const selectedCount = enabledValues.filter(isSelected).length
      return selectedCount > 0 && selectedCount < enabledValues.length
    },
    isSelected,
    setSelected,
    toggle(value) {
      setSelected(value, !isSelected(value))
    },
    setAll(nextState) {
      if (selectionMode !== 'multiple') return

      const enabledValues = getEnabledValues()
      const enabledSet = new Set(enabledValues)
      const preservedValues = selected.filter((value) => !enabledSet.has(value))

      commitSelection(
        nextState ? [...preservedValues, ...enabledValues] : preservedValues,
      )
    },
    register(row) {
      rows = [...rows, row]

      return () => {
        rows = rows.filter((candidate) => candidate !== row)
      }
    },
  })

  function getRows() {
    return Array.from(
      tableElement.querySelectorAll<HTMLTableRowElement>(ROW_SELECTOR),
    ).filter((row) => {
      const originalTabIndex = originalTabIndexes.has(row)
        ? originalTabIndexes.get(row)
        : row.getAttribute('tabindex')

      return (
        row.closest<HTMLTableElement>('table') === tableElement &&
        !row.hidden &&
        row.getAttribute('aria-hidden') !== 'true' &&
        originalTabIndex !== '-1'
      )
    })
  }

  function rememberTabIndex(row: HTMLTableRowElement) {
    if (!originalTabIndexes.has(row)) {
      originalTabIndexes.set(row, row.getAttribute('tabindex'))
    }
  }

  function setActiveRow(row: HTMLTableRowElement, focus = false) {
    const enabledRows = getRows()
    if (!enabledRows.includes(row)) return

    for (const candidate of enabledRows) {
      rememberTabIndex(candidate)
      candidate.tabIndex = candidate === row ? 0 : -1
    }

    activeRow = row
    if (focus) row.focus()
  }

  function syncTabStops() {
    const enabledRows = getRows()

    if (enabledRows.length === 0) {
      activeRow = null
      return
    }

    const nextActive =
      activeRow && enabledRows.includes(activeRow)
        ? activeRow
        : enabledRows.find(
            (row) => row.getAttribute('aria-selected') === 'true',
          ) ?? enabledRows[0]

    setActiveRow(nextActive)
  }

  function resolveRow(target: EventTarget | null) {
    const row =
      target instanceof Element
        ? target.closest<HTMLTableRowElement>('.lds-data-table__row')
        : null

    return row?.closest<HTMLTableElement>('table') === tableElement
      ? row
      : null
  }

  function handleFocusin(event: DataTableFocusEvent) {
    userOnfocusin?.(event)
    if (event.defaultPrevented) return

    const focusedRow = resolveRow(event.target)
    if (focusedRow && focusedRow.getAttribute('aria-disabled') !== 'true') {
      setActiveRow(focusedRow)
    }
  }

  function handleKeydown(event: DataTableKeyboardEvent) {
    userOnkeydown?.(event)
    if (
      event.defaultPrevented ||
      !(event.target instanceof HTMLTableRowElement) ||
      !['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)
    ) {
      return
    }

    const currentRow = resolveRow(event.target)
    if (!currentRow) return

    const enabledRows = getRows()
    const currentIndex = enabledRows.indexOf(currentRow)
    if (enabledRows.length === 0 || currentIndex === -1) return

    let nextIndex: number

    if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = enabledRows.length - 1
    } else {
      const direction = event.key === 'ArrowUp' ? -1 : 1
      nextIndex = currentIndex + direction

      if (loop) {
        nextIndex = (nextIndex + enabledRows.length) % enabledRows.length
      } else {
        nextIndex = Math.min(Math.max(nextIndex, 0), enabledRows.length - 1)
      }
    }

    event.preventDefault()
    setActiveRow(enabledRows[nextIndex], true)
  }

  onMount(() => {
    syncTabStops()

    const observer = new MutationObserver(syncTabStops)
    observer.observe(tableElement, {
      attributes: true,
      attributeFilter: [
        'aria-disabled',
        'aria-hidden',
        'aria-selected',
        'hidden',
      ],
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()

      for (const [row, originalTabIndex] of originalTabIndexes) {
        if (originalTabIndex === null) {
          row.removeAttribute('tabindex')
        } else {
          row.setAttribute('tabindex', originalTabIndex)
        }
      }
    }
  })
</script>

<div class={`lds-data-table__viewport ${viewportClass}`}>
  <table
    bind:this={tableElement}
    {...attributes}
    class={`lds-data-table ${stickyHeader ? 'lds-data-table--sticky-header' : ''} ${className}`}
    data-selection-mode={selectionMode}
    onfocusin={handleFocusin}
    onkeydown={handleKeydown}
  >
    {#if caption}
      <caption class="lds-data-table__caption">{caption}</caption>
    {/if}

    {@render children()}
  </table>
</div>
