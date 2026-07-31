<script lang="ts">
  import { onDestroy } from 'svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'
  import FieldShell from './FieldShell.svelte'
  import Icon from './Icon.svelte'
  import ListboxPopup from './ListboxPopup.svelte'
  import type { ListboxOption, ListboxValue } from './listbox'

  type InputEventOf<T extends Event> = T & {
    currentTarget: EventTarget & HTMLInputElement
  }

  export type ComboboxProps = Omit<
    HTMLInputAttributes,
    | 'children'
    | 'class'
    | 'disabled'
    | 'name'
    | 'readonly'
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
    emptyText?: string
    toggleLabel?: string
    requiredMessage?: string
    name?: string
    class?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    onvaluechange?: (value: ListboxValue | undefined) => void
  }

  let {
    label,
    options,
    value = $bindable<ListboxValue | undefined>(undefined),
    placeholder,
    helperText,
    error,
    emptyText = 'No results',
    toggleLabel = 'Toggle options',
    requiredMessage = 'Select an option.',
    name,
    class: className = '',
    disabled = false,
    readonly = false,
    required = false,
    id: inputId,
    autocomplete = 'off',
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    onblur: userOnblur,
    onclick: userOnclick,
    onfocus: userOnfocus,
    oninput: userOninput,
    onkeydown: userOnkeydown,
    onvaluechange,
    ...attributes
  }: ComboboxProps = $props()

  const fieldId = $props.id()
  const listboxId = `${fieldId}-listbox`
  let resolvedInputId = $derived(inputId ?? `${fieldId}-control`)
  let inputElement = $state<HTMLInputElement>()
  let open = $state(false)
  let closing = $state(false)
  let filtering = $state(false)
  let activeIndex = $state(-1)
  let blurTimer: ReturnType<typeof setTimeout> | undefined

  let selectedOption = $derived(
    options.find((option) => option.value === value),
  )
  let query = $state('')
  let filteredOptions = $derived.by(() => {
    if (!filtering) {
      return options
    }

    const normalizedQuery = query.trim().toLocaleLowerCase()

    if (!normalizedQuery) {
      return options
    }

    return options.filter((option) => {
      const searchableText = [
        option.label,
        String(option.value),
        ...(option.keywords ?? []),
      ]
        .join(' ')
        .toLocaleLowerCase()

      return searchableText.includes(normalizedQuery)
    })
  })
  let activeOption = $derived(
    activeIndex >= 0 ? filteredOptions[activeIndex] : undefined,
  )
  let activeOptionId = $derived(
    open && activeOption
      ? `${listboxId}-option-${activeIndex}`
      : undefined,
  )
  let rootClass = $derived(
    [
      'lds-combobox',
      error && 'lds-combobox--error',
      disabled && 'lds-combobox--disabled',
      readonly && 'lds-combobox--readonly',
      open && 'lds-combobox--open',
      (open || closing) && 'lds-field--listbox-present',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  )

  $effect(() => {
    if (!open) {
      query = selectedOption?.label ?? ''
    }
  })

  $effect(() => {
    if (activeOptionId) {
      document
        .getElementById(activeOptionId)
        ?.scrollIntoView({ block: 'nearest' })
    }
  })

  $effect(() => {
    inputElement?.setCustomValidity(
      required && value === undefined
        ? (error ?? requiredMessage)
        : '',
    )
  })

  function firstEnabledIndex(
    items: readonly ListboxOption[],
    direction: 1 | -1 = 1,
  ) {
    if (direction === 1) {
      return items.findIndex((option) => !option.disabled)
    }

    for (let index = items.length - 1; index >= 0; index -= 1) {
      if (!items[index]?.disabled) {
        return index
      }
    }

    return -1
  }

  function openList() {
    if (disabled || readonly) {
      return
    }

    closing = false
    open = true
    const selectedIndex = filteredOptions.findIndex(
      (option) => option.value === value && !option.disabled,
    )
    activeIndex =
      selectedIndex >= 0
        ? selectedIndex
        : firstEnabledIndex(filteredOptions)
  }

  function closeList(restoreSelection = false) {
    if (open) {
      closing = true
    }

    open = false
    filtering = false
    activeIndex = -1

    if (restoreSelection) {
      query = selectedOption?.label ?? ''
    }
  }

  function moveActive(direction: 1 | -1) {
    if (filteredOptions.length === 0) {
      activeIndex = -1
      return
    }

    let nextIndex = activeIndex

    for (let attempt = 0; attempt < filteredOptions.length; attempt += 1) {
      nextIndex =
        (nextIndex + direction + filteredOptions.length) %
        filteredOptions.length

      if (!filteredOptions[nextIndex]?.disabled) {
        activeIndex = nextIndex
        return
      }
    }

    activeIndex = -1
  }

  function selectOption(option: ListboxOption) {
    if (option.disabled) {
      return
    }

    value = option.value
    query = option.label
    closeList()
    onvaluechange?.(option.value)
    inputElement?.focus()
  }

  function handleFocus(event: InputEventOf<FocusEvent>) {
    userOnfocus?.(event)

    if (blurTimer !== undefined) {
      clearTimeout(blurTimer)
      blurTimer = undefined
    }

    if (!event.defaultPrevented) {
      openList()
    }
  }

  function handleClick(event: InputEventOf<MouseEvent>) {
    userOnclick?.(event)

    if (!event.defaultPrevented && !open) {
      openList()
    }
  }

  function handleInput(event: InputEventOf<Event>) {
    userOninput?.(event)

    if (event.defaultPrevented) {
      event.currentTarget.value = query
      return
    }

    filtering = true
    query = event.currentTarget.value

    if (value !== undefined) {
      value = undefined
      onvaluechange?.(undefined)
    }

    open = true
    activeIndex = firstEnabledIndex(filteredOptions)
  }

  function handleKeydown(event: InputEventOf<KeyboardEvent>) {
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
        break
      case 'ArrowUp':
        event.preventDefault()
        if (open) {
          moveActive(-1)
        } else {
          openList()
          activeIndex = firstEnabledIndex(filteredOptions, -1)
        }
        break
      case 'Home':
        if (open) {
          event.preventDefault()
          activeIndex = firstEnabledIndex(filteredOptions)
        }
        break
      case 'End':
        if (open) {
          event.preventDefault()
          activeIndex = firstEnabledIndex(filteredOptions, -1)
        }
        break
      case 'Enter':
        if (open && activeOption && !event.isComposing) {
          event.preventDefault()
          selectOption(activeOption)
        }
        break
      case 'Escape':
        if (open) {
          event.preventDefault()
          closeList(true)
        }
        break
      case 'Tab':
        closeList(true)
        break
    }
  }

  function handleBlur(event: InputEventOf<FocusEvent>) {
    userOnblur?.(event)

    blurTimer = setTimeout(() => {
      closeList(true)
      blurTimer = undefined
    })
  }

  function handleTogglePointerdown(event: PointerEvent) {
    event.preventDefault()
  }

  function handleToggle() {
    const shouldOpen = !open
    inputElement?.focus()

    if (shouldOpen) {
      openList()
    } else {
      closeList(true)
    }
  }

  function handleListboxCollapse() {
    closing = false
  }

  onDestroy(() => {
    if (blurTimer !== undefined) {
      clearTimeout(blurTimer)
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
  partPrefix="lds-combobox"
>
  {#snippet children(field)}
    <input
      {...attributes}
      id={field.id}
      class="lds-combobox__input"
      type="text"
      value={query}
      {disabled}
      {readonly}
      {required}
      {autocomplete}
      bind:this={inputElement}
      role="combobox"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-activedescendant={activeOptionId}
      aria-invalid={field.invalid}
      aria-describedby={field.describedBy}
      onfocus={handleFocus}
      onclick={handleClick}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onblur={handleBlur}
    />

    <button
      class="lds-combobox__toggle"
      type="button"
      tabindex="-1"
      aria-label={toggleLabel}
      aria-expanded={open}
      aria-controls={listboxId}
      disabled={disabled || readonly}
      onpointerdown={handleTogglePointerdown}
      onclick={handleToggle}
    >
      <Icon name="chevron-down" size={14} />
    </button>

    {#if name}
      <input
        type="hidden"
        {name}
        value={value === undefined ? '' : String(value)}
        {disabled}
      />
    {/if}
  {/snippet}

  {#snippet popup()}
    <ListboxPopup
      id={listboxId}
      class="lds-combobox__listbox"
      {label}
      {open}
      oncollapsecomplete={handleListboxCollapse}
    >
      {#if filteredOptions.length === 0}
        <div class="lds-field__empty" role="presentation">
          {emptyText}
        </div>
      {:else}
        {#each filteredOptions as option, index (option.value)}
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
      {/if}
    </ListboxPopup>
  {/snippet}
</FieldShell>
