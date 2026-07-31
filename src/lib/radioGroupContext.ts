import { getContext, setContext } from 'svelte'

export type RadioValue = string | number

export type RadioGroupContext = {
  readonly name: string
  readonly value: RadioValue | undefined
  readonly disabled: boolean
  readonly required: boolean
  readonly describedBy: string | undefined
  readonly invalid: boolean
  select: (value: RadioValue) => void
}

const RADIO_GROUP_CONTEXT = Symbol('lds-radio-group')

export function setRadioGroupContext(context: RadioGroupContext) {
  setContext(RADIO_GROUP_CONTEXT, context)
}

export function getRadioGroupContext() {
  return getContext<RadioGroupContext | undefined>(RADIO_GROUP_CONTEXT)
}
