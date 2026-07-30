<script lang="ts">
  import { onDestroy } from 'svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'

  type InputKeyboardEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLInputElement
  }

  type TextFieldProps = Omit<
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
    onkeydown: userOnkeydown,
    ...attributes
  }: TextFieldProps = $props()

  const fieldId = $props.id()
  const supportId = `${fieldId}-support`
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

<label class={rootClass}>
  <span class="lds-text-field__label">
    {label}
    {#if required}
      <span class="lds-text-field__required" aria-hidden="true">*</span>
    {/if}
  </span>

  <span class="lds-text-field__control">
    <input
      {...attributes}
      class="lds-text-field__input"
      {type}
      {disabled}
      {readonly}
      {required}
      bind:this={inputElement}
      bind:value
      onkeydown={handleKeydown}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error || helperText ? supportId : undefined}
    />
  </span>

  {#if error || helperText}
    <span
      id={supportId}
      class="lds-text-field__support"
      aria-live={error ? 'polite' : undefined}
    >
      {error ?? helperText}
    </span>
  {/if}
</label>
