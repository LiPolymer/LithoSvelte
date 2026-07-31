<script lang="ts">
  import { setContext } from 'svelte'
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import {
    buttonGroupContextKey,
    type ButtonGroupContext,
    type ButtonGroupMode,
    type ButtonGroupValue,
  } from './buttonGroupContext'

  type GroupKeyboardEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLDivElement
  }

  type ButtonGroupProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'class' | 'onkeydown' | 'role'
  > & {
    children?: Snippet
    class?: string
    mode?: ButtonGroupMode
    value?: ButtonGroupValue
    onkeydown?: HTMLAttributes<HTMLDivElement>['onkeydown']
  }

  let {
    children,
    class: className = '',
    mode = 'actions',
    value = $bindable<ButtonGroupValue | undefined>(undefined),
    onkeydown: userOnkeydown,
    ...attributes
  }: ButtonGroupProps = $props()

  const context: ButtonGroupContext = {
    get mode() {
      return mode
    },
    get value() {
      return value
    },
    select(nextValue) {
      if (mode === 'options') {
        value = nextValue
      }
    },
  }

  setContext(buttonGroupContextKey, context)

  function handleKeydown(event: GroupKeyboardEvent) {
    userOnkeydown?.(event)

    if (
      event.defaultPrevented ||
      mode !== 'options' ||
      !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(
        event.key,
      )
    ) {
      return
    }

    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        ':scope > .lds-btn:not(:disabled), :scope > .lds-tooltip-anchor > .lds-btn:not(:disabled)',
      ),
    )
    const currentButton = (event.target as Element | null)?.closest(
      '.lds-btn',
    ) as HTMLButtonElement | null
    const currentIndex = currentButton ? buttons.indexOf(currentButton) : -1

    if (buttons.length === 0 || currentIndex === -1) {
      return
    }

    let nextIndex: number

    switch (event.key) {
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = buttons.length - 1
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length
        break
      default:
        nextIndex = (currentIndex + 1) % buttons.length
    }

    event.preventDefault()
    buttons[nextIndex].focus()
    buttons[nextIndex].click()
  }
</script>

<div
  {...attributes}
  class={`lds-button-group lds-button-group--${mode} ${className}`}
  role="group"
  data-mode={mode}
  onkeydown={handleKeydown}
>
  {@render children?.()}
</div>
