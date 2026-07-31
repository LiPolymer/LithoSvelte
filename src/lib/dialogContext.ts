import { getContext, setContext } from 'svelte'

const DIALOG_CONTEXT = Symbol('lds-dialog')

export type DialogContext = {
  close(originalEvent?: Event): void
}

export function setDialogContext(context: DialogContext) {
  setContext(DIALOG_CONTEXT, context)
}

export function getDialogContext() {
  return getContext<DialogContext | undefined>(DIALOG_CONTEXT)
}
