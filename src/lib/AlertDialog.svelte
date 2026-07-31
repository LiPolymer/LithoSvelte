<script lang="ts">
  import type { Snippet } from 'svelte'
  import Dialog, {
    type DialogInitialFocus,
    type DialogProps,
  } from './Dialog.svelte'

  export type AlertDialogProps = Omit<
    DialogProps,
    | 'actions'
    | 'description'
    | 'dismissOnPointerOutside'
    | 'initialFocus'
    | 'role'
  > & {
    description: Snippet
    actions: Snippet
    dismissOnPointerOutside?: boolean
    initialFocus?: DialogInitialFocus
  }

  let {
    title,
    trigger,
    description,
    children,
    actions,
    open = $bindable(false),
    dismissOnPointerOutside = false,
    initialFocus = 'first',
    showClose = false,
    class: className = '',
    ...attributes
  }: AlertDialogProps = $props()
</script>

<Dialog
  {...attributes}
  bind:open
  {title}
  {trigger}
  {description}
  {children}
  {actions}
  {dismissOnPointerOutside}
  {initialFocus}
  {showClose}
  role="alertdialog"
  class={`lds-alert-dialog ${className}`}
/>
