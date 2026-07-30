import { getContext } from 'svelte'

export type ButtonGroupMode = 'actions' | 'options'
export type ButtonGroupValue = string | number

export type ButtonGroupContext = {
  readonly mode: ButtonGroupMode
  readonly value: ButtonGroupValue | undefined
  select: (value: ButtonGroupValue) => void
}

export const buttonGroupContextKey = Symbol.for('litho.button-group')

export function getButtonGroupContext() {
  return getContext<ButtonGroupContext | undefined>(buttonGroupContextKey)
}

export function isButtonGroupValue(
  value: unknown,
): value is ButtonGroupValue {
  return typeof value === 'string' || typeof value === 'number'
}
