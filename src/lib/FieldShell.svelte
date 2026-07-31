<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  type AriaInvalid = HTMLAttributes<HTMLDivElement>['aria-invalid']

  export type FieldControlContext = {
    id: string
    describedBy?: string
    invalid?: AriaInvalid
  }

  type FieldShellProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'class'
  > & {
    label: string
    children: Snippet<[FieldControlContext]>
    popup?: Snippet
    controlId?: string
    controlDescribedBy?: string | null
    controlInvalid?: FieldControlContext['invalid']
    helperText?: string
    error?: string
    class?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    partPrefix?: string
  }

  let {
    label,
    children,
    popup,
    controlId,
    controlDescribedBy,
    controlInvalid,
    helperText,
    error,
    class: className = '',
    disabled = false,
    readonly = false,
    required = false,
    partPrefix,
    ...attributes
  }: FieldShellProps = $props()

  const fieldId = $props.id()
  let resolvedControlId = $derived(controlId ?? `${fieldId}-control`)
  let supportId = $derived(`${resolvedControlId}-support`)
  let hasSupport = $derived(Boolean(error || helperText))
  let describedBy = $derived(
    [controlDescribedBy, hasSupport && supportId]
      .filter(Boolean)
      .join(' ') || undefined,
  )
  let invalid = $derived(error ? 'true' : controlInvalid)
  let rootClass = $derived(
    [
      'lds-field',
      error && 'lds-field--error',
      disabled && 'lds-field--disabled',
      readonly && 'lds-field--readonly',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  )
  let controlContext = $derived<FieldControlContext>({
    id: resolvedControlId,
    describedBy,
    invalid,
  })

  function partClass(
    part: 'label' | 'required' | 'body' | 'control' | 'support',
  ) {
    return [
      `lds-field__${part}`,
      partPrefix && `${partPrefix}__${part}`,
    ]
      .filter(Boolean)
      .join(' ')
  }
</script>

<div {...attributes} class={rootClass}>
  <label class={partClass('label')} for={resolvedControlId}>
    {label}
    {#if required}
      <span class={partClass('required')} aria-hidden="true">*</span>
    {/if}
  </label>

  <div class={partClass('body')}>
    <div class={partClass('control')}>
      {@render children(controlContext)}
    </div>

    {#if popup}
      {@render popup()}
    {/if}
  </div>

  {#if hasSupport}
    <span
      id={supportId}
      class={partClass('support')}
      aria-live={error ? 'polite' : undefined}
    >
      {error ?? helperText}
    </span>
  {/if}
</div>
