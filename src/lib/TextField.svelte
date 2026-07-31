<script lang="ts">
  import { onDestroy } from 'svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'
  import FieldShell from './FieldShell.svelte'

  type InputKeyboardEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLInputElement
  }

  export type TextFieldProps = Omit<
    HTMLInputAttributes,
    'children' | 'class' | 'disabled' | 'readonly' | 'required' | 'type' | 'value'
  > & {
    label: string
    value?: any
    helperText?: string
    error?: string
    class?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    type?: HTMLInputAttributes['type']
    commitOnEnter?: boolean
    oncommit?: (value: any) => void
  }

  let {
    label,
    value = $bindable(''),
    helperText,
    error,
    class: className = '',
    disabled = false,
    readonly = false,
    required = false,
    type = 'text',
    commitOnEnter = false,
    oncommit,
    id: inputId,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    onkeydown: userOnkeydown,
    ...attributes
  }: TextFieldProps = $props()

  const fieldId = $props.id()
  let resolvedInputId = $derived(inputId ?? `${fieldId}-control`)
  let inputElement = $state<HTMLInputElement>()
  let committing = $state(false)
  let commitTimer: ReturnType<typeof setTimeout> | undefined

  let rootClass = $derived(
    [
      'lds-text-field',
      error && 'lds-text-field--error',
      disabled && 'lds-text-field--disabled',
      readonly && 'lds-text-field--readonly',
      committing && 'lds-text-field--committing',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  )

  function handleKeydown(event: InputKeyboardEvent) {
    userOnkeydown?.(event)

    if (
      event.defaultPrevented ||
      !commitOnEnter ||
      event.key !== 'Enter' ||
      event.isComposing ||
      disabled ||
      readonly ||
      committing
    ) {
      return
    }

    event.preventDefault()
    committing = true
    oncommit?.(value)

    commitTimer = setTimeout(() => {
      inputElement?.blur()
      committing = false
      commitTimer = undefined
    }, 100)
  }

  onDestroy(() => {
    if (commitTimer !== undefined) {
      clearTimeout(commitTimer)
    }
  })
</script>

<FieldShell
  {label}
  controlId={resolvedInputId}
  controlDescribedBy={ariaDescribedBy}
  controlInvalid={ariaInvalid}
  {helperText}
  {error}
  class={rootClass}
  {disabled}
  {readonly}
  {required}
  partPrefix="lds-text-field"
>
  {#snippet children(field)}
    <input
      {...attributes}
      id={field.id}
      class="lds-text-field__input"
      {type}
      {disabled}
      {readonly}
      {required}
      bind:this={inputElement}
      bind:value
      onkeydown={handleKeydown}
      aria-invalid={field.invalid}
      aria-describedby={field.describedBy}
    />
  {/snippet}
</FieldShell>
