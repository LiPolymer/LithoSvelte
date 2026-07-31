<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { getDialogContext } from './dialogContext'

  type DialogCloseMouseEvent = MouseEvent & {
    currentTarget: EventTarget & HTMLSpanElement
  }

  export type DialogCloseProps = Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class' | 'onclick'
  > & {
    children: Snippet
    class?: string
    onclick?: (event: DialogCloseMouseEvent) => void
  }

  let {
    children,
    class: className = '',
    onclick: userOnclick,
    ...attributes
  }: DialogCloseProps = $props()

  const dialog = getDialogContext()

  if (!dialog) {
    throw new Error('DialogClose must be used inside Dialog or AlertDialog.')
  }

  const dialogContext = dialog

  function handleClick(event: DialogCloseMouseEvent) {
    userOnclick?.(event)
    if (event.defaultPrevented || event.button !== 0) return

    const trigger =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>(
            'button, a[href], input, select, textarea, [tabindex]',
          )
        : null

    if (
      !trigger ||
      !event.currentTarget.contains(trigger) ||
      trigger.matches(':disabled') ||
      trigger.getAttribute('aria-disabled') === 'true'
    ) {
      return
    }

    dialogContext.close(event)
  }
</script>

<span
  {...attributes}
  class={`lds-dialog-close ${className}`}
  onclick={handleClick}
>
  {@render children()}
</span>
