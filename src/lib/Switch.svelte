<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'

  export type SwitchProps = Omit<
    HTMLInputAttributes,
    'checked' | 'children' | 'class' | 'disabled' | 'role' | 'type'
  > & {
    checked?: boolean
    children?: Snippet
    class?: string
    disabled?: boolean
  }

  let {
    checked = $bindable(false),
    children,
    class: className = '',
    disabled = false,
    ...attributes
  }: SwitchProps = $props()
</script>

<label class={`lds-selection lds-switch ${className}`}>
  <input
    {...attributes}
    class="lds-selection__input lds-switch__input"
    type="checkbox"
    role="switch"
    {disabled}
    bind:checked
    aria-checked={checked}
  />

  <span class="lds-switch__track" aria-hidden="true">
    <span class="lds-switch__thumb"></span>
  </span>

  {#if children}
    <span class="lds-switch__label">
      {@render children()}
    </span>
  {/if}
</label>
