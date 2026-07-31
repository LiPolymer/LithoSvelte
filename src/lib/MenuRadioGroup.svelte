<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import {
    setMenuRadioGroupContext,
    type MenuValue,
  } from './menuContext'

  export type MenuRadioGroupProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    'aria-label' | 'children' | 'class' | 'role'
  > & {
    label: string
    children: Snippet
    value?: MenuValue
    disabled?: boolean
    class?: string
    onvaluechange?: (value: MenuValue) => void
  }

  let {
    label,
    children,
    value = $bindable<MenuValue | undefined>(undefined),
    disabled = false,
    class: className = '',
    onvaluechange,
    ...attributes
  }: MenuRadioGroupProps = $props()

  setMenuRadioGroupContext({
    get value() {
      return value
    },
    get disabled() {
      return disabled
    },
    select(nextValue) {
      if (disabled || value === nextValue) return

      value = nextValue
      onvaluechange?.(nextValue)
    },
  })
</script>

<div
  {...attributes}
  class={`lds-menu__radio-group ${className}`}
  role="group"
  aria-label={label}
>
  {@render children()}
</div>
