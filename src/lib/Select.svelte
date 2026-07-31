<script lang="ts">
  import { onDestroy, tick } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import FieldShell from './FieldShell.svelte'
  import Icon from './Icon.svelte'
  import ListboxPopup from './ListboxPopup.svelte'
  import type { ListboxOption, ListboxValue } from './listbox'

  type ButtonEventOf<T extends Event> = T & {
    currentTarget: EventTarget & HTMLButtonElement
  }

  type SelectInvalidEvent = Event & {
    currentTarget: EventTarget & HTMLSelectElement
  }

  type SelectProps = Omit<
    HTMLButtonAttributes,
    | 'children'
    | 'class'
    | 'disabled'
    | 'form'
    | 'name'
    | 'oninvalid'
    | 'required'
    | 'role'
    | 'type'
    | 'value'
  > & {
    label: string
    options: readonly ListboxOption[]
    value?: ListboxValue
    placeholder?: string
    helperText?: string
    error?: string
    requiredMessage?: string
    form?: string
    name?: string
    class?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    oninvalid?: (event: SelectInvalidEvent) => void
    onvaluechange?: (value: ListboxValue | undefined) => void
  }

  let {
    label,
    options,
    value = $bindable<ListboxValue | undefined>(undefined),
    placeholder = 'Select an option',
    helperText,
    error,
    requiredMessage = 'Select an option.',
    form,
    name,
    class: className = '',
    disabled = false,
    readonly = false,
    required = false,
    id: selectId,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    onblur: userOnblur,
    onclick: userOnclick,
    onfocus: userOnfocus,
    onkeydown: userOnkeydown,
    oninvalid: userOninvalid,
    onvaluechange,
    ...attributes
  }: SelectProps = $props()

  const fieldId = $props.id()
  const listboxId = `${fieldId}-listbox`
  let resolvedSelectId = $derived(selectId ?? `${fieldId}-control`)
  let triggerElement = $state<HTMLButtonElement>()
  let nativeSelectElement = $state<HTMLSelectElement>()
  let open = $state(false)
  let closing = $state(false)
  let activeIndex = $state(-1)
  let showRequiredError = $state(false)
  let blurTimer: ReturnType<typeof setTimeout> | undefined
  let typeaheadTimer: ReturnType<typeof setTimeout> | undefined
  let typeaheadQuery = ''

  let selectedOption = $derived(
    options.find((option) => option.value === value),
  )
  let activeOption = $derived(
    activeIndex >= 0 ? options[activeIndex] : undefined,
  )
  let activeOptionId = $derived(
    open && activeOption
      ? `${listboxId}-option-${activeIndex}`
      : undefined,
  )
  let displayedError = $derived(
    error ?? (showRequiredError ? requiredMessage : undefined),
  )
  let rootClass = $derived(
    [
      'lds-select',
      displayedError && 'lds-select--error',
      disabled && 'lds-select--disabled',
      readonly && 'lds-select--readonly',
      value === undefined && 'lds-select--placeholder',
      open && 'lds-select--open',
      (open || closing) && 'lds-field--listbox-present',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  )

  $effect(() => {
    if (!required || value !== undefined) {
      showRequiredError = false
    }
  })

  $effect(() => {
    if (activeOptionId) {
      document
        .getElementById(activeOptionId)
        ?.scrollIntoView({ block: 'nearest' })
    }
  })

  function firstEnabledIndex(direction: 1 | -1 = 1) {
    if (direction === 1) {
      return options.findIndex((option) => !option.disabled)
    }

    for (let index = options.length - 1; index >= 0; index -= 1) {
      if (!options[index]?.disabled) {
        return index
      }
    }

    return -1
  }

  function openList(preferred: 'selected' | 'first' | 'last' = 'selected') {
    if (disabled || readonly) {
      return
    }

    closing = false
    open = true

    if (preferred === 'first') {
      activeIndex = firstEnabledIndex()
      return
    }

    if (preferred === 'last') {
      activeIndex = firstEnabledIndex(-1)
      return
    }

    const selectedIndex = options.findIndex(
      (option) => option.value === value && !option.disabled,
    )
    activeIndex =
      selectedIndex >= 0 ? selectedIndex : firstEnabledIndex()
  }

  function closeList() {
    if (open) {
      closing = true
    }

    open = false
    activeIndex = -1
  }

  function handleListboxCollapse() {
    closing = false
  }

  function moveActive(direction: 1 | -1) {
    if (options.length === 0) {
      activeIndex = -1
      return
    }

    let nextIndex = activeIndex

    for (let attempt = 0; attempt < options.length; attempt += 1) {
      nextIndex =
        (nextIndex + direction + options.length) % options.length

      if (!options[nextIndex]?.disabled) {
        activeIndex = nextIndex
        return
      }
    }

    activeIndex = -1
  }

  function findTypeaheadMatch(query: string) {
    const normalizedQuery = query.toLocaleLowerCase()
    const startIndex = Math.max(activeIndex, -1)

    for (let offset = 1; offset <= options.length; offset += 1) {
      const index = (startIndex + offset) % options.length
      const option = options[index]

      if (
        option &&
        !option.disabled &&
        option.label.toLocaleLowerCase().startsWith(normalizedQuery)
      ) {
        return index
      }
    }

    return -1
  }

  function handleTypeahead(key: string) {
    if (typeaheadTimer !== undefined) {
      clearTimeout(typeaheadTimer)
    }

    typeaheadQuery += key
    let matchIndex = findTypeaheadMatch(typeaheadQuery)

    if (matchIndex < 0 && typeaheadQuery.length > 1) {
      typeaheadQuery = key
      matchIndex = findTypeaheadMatch(typeaheadQuery)
    }

    if (matchIndex >= 0) {
      if (!open) {
        open = true
      }
      activeIndex = matchIndex
    }

    typeaheadTimer = setTimeout(() => {
      typeaheadQuery = ''
      typeaheadTimer = undefined
    }, 500)
  }

  async function notifyNativeChange() {
    await tick()
    nativeSelectElement?.dispatchEvent(
      new Event('input', { bubbles: true }),
    )
    nativeSelectElement?.dispatchEvent(
      new Event('change', { bubbles: true }),
    )
  }

  function selectOption(option: ListboxOption) {
    if (option.disabled) {
      return
    }

    value = option.value
    closeList()
    onvaluechange?.(option.value)
    triggerElement?.focus()
    void notifyNativeChange()
  }

  function handleClick(event: ButtonEventOf<MouseEvent>) {
    userOnclick?.(event)

    if (event.defaultPrevented || disabled || readonly) {
      return
    }

    if (open) {
      closeList()
    } else {
      openList()
    }
  }

  function handleFocus(event: ButtonEventOf<FocusEvent>) {
    userOnfocus?.(event)

    if (blurTimer !== undefined) {
      clearTimeout(blurTimer)
      blurTimer = undefined
    }
  }

  function handleBlur(event: ButtonEventOf<FocusEvent>) {
    userOnblur?.(event)

    blurTimer = setTimeout(() => {
      closeList()
      blurTimer = undefined
    })
  }

  function handleKeydown(event: ButtonEventOf<KeyboardEvent>) {
    userOnkeydown?.(event)

    if (event.defaultPrevented || disabled || readonly) {
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (open) {
          moveActive(1)
        } else {
          openList()
        }
        return
      case 'ArrowUp':
        event.preventDefault()
        if (open) {
          moveActive(-1)
        } else {
          openList()
        }
        return
      case 'Home':
        event.preventDefault()
        if (open) {
          activeIndex = firstEnabledIndex()
        } else {
          openList('first')
        }
        return
      case 'End':
        event.preventDefault()
        if (open) {
          activeIndex = firstEnabledIndex(-1)
        } else {
          openList('last')
        }
        return
      case 'Enter':
      case ' ':
        if (event.isComposing) {
          return
        }

        event.preventDefault()
        if (open && activeOption) {
          selectOption(activeOption)
        } else {
          openList()
        }
        return
      case 'Escape':
        if (open) {
          event.preventDefault()
          closeList()
        }
        return
      case 'Tab':
        closeList()
        return
    }

    if (
      event.key.length === 1 &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.isComposing
    ) {
      event.preventDefault()
      handleTypeahead(event.key)
    }
  }

  function handleInvalid(event: SelectInvalidEvent) {
    userOninvalid?.(event)

    if (event.defaultPrevented) {
      return
    }

    event.preventDefault()
    showRequiredError = true
    triggerElement?.focus()
  }

  onDestroy(() => {
    if (blurTimer !== undefined) {
      clearTimeout(blurTimer)
    }

    if (typeaheadTimer !== undefined) {
      clearTimeout(typeaheadTimer)
    }
  })
</script>

<FieldShell
  {label}
  controlId={resolvedSelectId}
  controlDescribedBy={ariaDescribedBy}
  controlInvalid={ariaInvalid}
  {helperText}
  error={displayedError}
  class={rootClass}
  {disabled}
  {readonly}
  {required}
  partPrefix="lds-select"
>
  {#snippet children(field)}
    <button
      {...attributes}
      id={field.id}
      class="lds-select__trigger"
      type="button"
      {disabled}
      bind:this={triggerElement}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-activedescendant={activeOptionId}
      aria-invalid={field.invalid}
      aria-describedby={field.describedBy}
      aria-readonly={readonly || undefined}
      aria-required={required || undefined}
      onclick={handleClick}
      onfocus={handleFocus}
      onblur={handleBlur}
      onkeydown={handleKeydown}
    >
      <span class="lds-select__value">
        {selectedOption?.label ?? placeholder}
      </span>
      <Icon name="chevron-down" size={14} />
    </button>

    <select
      class="lds-select__native"
      bind:this={nativeSelectElement}
      bind:value
      {form}
      {name}
      {required}
      disabled={disabled}
      tabindex="-1"
      aria-hidden="true"
      oninvalid={handleInvalid}
    >
      <option value={undefined} disabled={required}>
        {placeholder}
      </option>

      {#each options as option (option.value)}
        <option value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      {/each}
    </select>
  {/snippet}

  {#snippet popup()}
    <ListboxPopup
      id={listboxId}
      class="lds-select__listbox"
      {label}
      {open}
      oncollapsecomplete={handleListboxCollapse}
    >
      {#each options as option, index (option.value)}
        <button
          id={`${listboxId}-option-${index}`}
          class={[
            'lds-field__option',
            activeIndex === index && 'lds-field__option--active',
          ]
            .filter(Boolean)
            .join(' ')}
          type="button"
          role="option"
          tabindex="-1"
          disabled={option.disabled}
          aria-disabled={option.disabled}
          aria-selected={option.value === value}
          onpointerdown={(event) => event.preventDefault()}
          onpointermove={() => (activeIndex = index)}
          onclick={() => selectOption(option)}
        >
          <span>{option.label}</span>
          {#if option.value === value}
            <Icon name="check" size={14} />
          {/if}
        </button>
      {/each}
    </ListboxPopup>
  {/snippet}
</FieldShell>
