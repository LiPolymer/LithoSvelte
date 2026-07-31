<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'

  type CheckboxProps = Omit<
    HTMLInputAttributes,
    'checked' | 'children' | 'class' | 'type'
  > & {
    checked?: boolean
    children?: Snippet
    class?: string
  }

  let {
    checked = $bindable(false),
    children,
    class: className = '',
    ...attributes
  }: CheckboxProps = $props()
</script>

<label class={`lds-selection lds-checkbox ${className}`}>
  <input
    {...attributes}
    class="lds-selection__input lds-checkbox__input"
    type="checkbox"
    bind:checked
  />

  <span class="lds-checkbox__box" aria-hidden="true">
    <svg
      class="lds-checkbox__mark"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8.25 6.25 11.5 13 4.75"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="square"
        stroke-linejoin="miter"
      />
    </svg>
  </span>

  {#if children}
    <span class="lds-checkbox__label">
      {@render children()}
    </span>
  {/if}
</label>
