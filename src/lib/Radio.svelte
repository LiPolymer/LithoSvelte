<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'
  import { getRadioGroupContext, type RadioValue } from './radioGroupContext'

  type RadioInputEvent<T extends Event> = T & {
    currentTarget: EventTarget & HTMLInputElement
  }

  export type RadioProps = Omit<
    HTMLInputAttributes,
    | 'checked'
    | 'children'
    | 'class'
    | 'disabled'
    | 'name'
    | 'required'
    | 'type'
    | 'value'
  > & {
    value: RadioValue
    children: Snippet
    class?: string
    disabled?: boolean
  }

  let {
    value,
    children,
    class: className = '',
    disabled = false,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': _ariaInvalid,
    onclick: userOnclick,
    onchange: userOnchange,
    ...attributes
  }: RadioProps = $props()

  const radioGroup = getRadioGroupContext()

  if (!radioGroup) {
    throw new Error('Radio must be used inside RadioGroup.')
  }

  const group = radioGroup

  let isDisabled = $derived(disabled || group.disabled)
  let isChecked = $derived(group.value === value)
  let describedBy = $derived(
    [ariaDescribedBy, group.describedBy].filter(Boolean).join(' ') || undefined,
  )

  function handleClick(event: RadioInputEvent<MouseEvent>) {
    userOnclick?.(event)

    if (!event.defaultPrevented && event.currentTarget.checked) {
      group.select(value)
    }
  }

  function handleChange(event: RadioInputEvent<Event>) {
    userOnchange?.(event)

    if (event.currentTarget.checked && group.value !== value) {
      group.select(value)
    }
  }
</script>

<label class={`lds-selection lds-radio ${className}`}>
  <input
    {...attributes}
    class="lds-selection__input lds-radio__input"
    type="radio"
    name={group.name}
    {value}
    checked={isChecked}
    disabled={isDisabled}
    required={group.required}
    aria-describedby={describedBy}
    onclick={handleClick}
    onchange={handleChange}
  />

  <span class="lds-radio__circle" aria-hidden="true">
    <span class="lds-radio__dot"></span>
  </span>

  <span class="lds-radio__label">
    {@render children()}
  </span>
</label>
