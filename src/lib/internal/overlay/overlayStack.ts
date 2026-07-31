export type OverlayDismissReason = 'escape' | 'outside-pointer'

export type OverlayDismissDetails = {
  reason: OverlayDismissReason
  originalEvent: Event
}

export type OverlayRegistrationOptions = {
  dismissOnEscape?: boolean
  modal?: boolean
  restoreFocus?: boolean
  onDismiss?: (details: OverlayDismissDetails) => void
  onLayerChange?: (order: number) => void
}

export type OverlayRegistration = {
  id: number
  unregister: () => void
}

type OverlayEntry = {
  id: number
  options: OverlayRegistrationOptions
  returnFocusTo: HTMLElement | null
}

const entries: OverlayEntry[] = []
let nextId = 0
let bodyStyleBeforeLock:
  | { overflow: string; paddingRight: string }
  | undefined

function topmostEntry() {
  return entries[entries.length - 1]
}

function notifyLayerChanges() {
  entries.forEach((entry, index) => {
    entry.options.onLayerChange?.(index + 1)
  })
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || event.defaultPrevented) return

  const entry = topmostEntry()
  if (!entry?.options.dismissOnEscape) return

  event.preventDefault()
  entry.options.onDismiss?.({
    reason: 'escape',
    originalEvent: event,
  })
}

function syncDocumentListener() {
  if (entries.length === 1) {
    document.addEventListener('keydown', handleDocumentKeydown)
  } else if (entries.length === 0) {
    document.removeEventListener('keydown', handleDocumentKeydown)
  }
}

function lockBodyScroll() {
  if (bodyStyleBeforeLock) return

  const { body, documentElement } = document
  const scrollbarWidth = Math.max(
    0,
    window.innerWidth - documentElement.clientWidth,
  )
  const computedPadding =
    Number.parseFloat(getComputedStyle(body).paddingRight) || 0

  bodyStyleBeforeLock = {
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
  }
  body.style.overflow = 'hidden'

  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${computedPadding + scrollbarWidth}px`
  }
}

function unlockBodyScroll() {
  if (!bodyStyleBeforeLock) return

  document.body.style.overflow = bodyStyleBeforeLock.overflow
  document.body.style.paddingRight = bodyStyleBeforeLock.paddingRight
  bodyStyleBeforeLock = undefined
}

function syncBodyScrollLock() {
  if (entries.some((entry) => entry.options.modal)) {
    lockBodyScroll()
  } else {
    unlockBodyScroll()
  }
}

export function isOverlayTopmost(id: number) {
  return topmostEntry()?.id === id
}

export function registerOverlay(
  options: OverlayRegistrationOptions = {},
): OverlayRegistration {
  const activeElement = document.activeElement
  const entry: OverlayEntry = {
    id: ++nextId,
    options,
    returnFocusTo:
      activeElement instanceof HTMLElement ? activeElement : null,
  }

  entries.push(entry)
  syncDocumentListener()
  syncBodyScrollLock()
  notifyLayerChanges()

  let registered = true

  return {
    id: entry.id,
    unregister() {
      if (!registered) return
      registered = false

      const index = entries.findIndex((candidate) => candidate.id === entry.id)
      const wasTopmost = index === entries.length - 1

      if (index >= 0) entries.splice(index, 1)
      syncDocumentListener()
      syncBodyScrollLock()
      notifyLayerChanges()

      if (
        wasTopmost &&
        options.restoreFocus &&
        entry.returnFocusTo?.isConnected
      ) {
        queueMicrotask(() => entry.returnFocusTo?.focus())
      }
    },
  }
}
