<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLFieldsetAttributes } from 'svelte/elements'
  import {
    setRadioGroupContext,
    type RadioValue,
  } from './radioGroupContext'

  type RadioGroupOrientation = 'horizontal' | 'vertical'

  type RadioGroupProps = Omit<
    HTMLFieldsetAttributes,
    'children' | 'class' | 'disabled' | 'name'
  > & {
    legend: string
    children: Snippet
    value?: RadioValue
    name?: string
    helperText?: string
    error?: string
    class?: string
    disabled?: boolean
    required?: boolean
    orientation?: RadioGroupOrientation
    onvaluechange?: (value: RadioValue) => void
  }

  let {
    legend,
    children,
    value = $bindable<RadioValue | undefined>(undefined),
    name,
    helperText,
    error,
    class: className = '',
    disabled = false,
    required = false,
    orientation = 'vertical',
    onvaluechange,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...attributes
  }: RadioGroupProps = $props()

  const groupId = $props.id()
  const legendId = `${groupId}-legend`
  const supportId = `${groupId}-support`
  let resolvedName = $derived(name ?? `${groupId}-radio`)
  let hasSupport = $derived(Boolean(error || helperText))
  let describedBy = $derived(
    [ariaDescribedBy, hasSupport && supportId]
      .filter(Boolean)
      .join(' ') || undefined,
  )
  let invalid = $derived(Boolean(error || ariaInvalid === true || ariaInvalid === 'true'))
  let rootClass = $derived(
    [
      'lds-radio-group',
      `lds-radio-group--${orientation}`,
      error && 'lds-radio-group--error',
      disabled && 'lds-radio-group--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  )

  setRadioGroupContext({
    get name() {
      return resolvedName
    },
    get value() {
      return value
    },
    get disabled() {
      return disabled
    },
    get required() {
      return required
    },
    get describedBy() {
      return describedBy
    },
    get invalid() {
      return invalid
    },
    select(nextValue) {
      if (disabled || value === nextValue) {
        return
      }

      value = nextValue
      onvaluechange?.(nextValue)
    },
  })
</script>

<fieldset
  {...attributes}
  class={rootClass}
  {disabled}
  role="radiogroup"
  aria-labelledby={legendId}
  aria-describedby={describedBy}
  aria-invalid={invalid || undefined}
  aria-required={required || undefined}
  aria-orientation={orientation}
>
  <legend id={legendId} class="lds-radio-group__legend">
    {legend}
    {#if required}
      <span class="lds-radio-group__required" aria-hidden="true">*</span>
    {/if}
  </legend>

  <div class="lds-radio-group__options">
    {@render children()}
  </div>

  {#if hasSupport}
    <span
      id={supportId}
      class="lds-radio-group__support"
      aria-live={error ? 'polite' : undefined}
    >
      {error ?? helperText}
    </span>
  {/if}
</fieldset>
