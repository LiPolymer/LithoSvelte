import { getContext, setContext } from 'svelte'

export type MenuValue = string | number

export type MenuOpenChangeReason =
  | 'escape'
  | 'outside-pointer'
  | 'select'
  | 'tab'
  | 'trigger'

export type MenuOpenChangeDetails = {
  reason: MenuOpenChangeReason
  originalEvent?: Event
}

export type MenuContext = {
  close: (
    details: MenuOpenChangeDetails,
    restoreFocus?: boolean,
  ) => void
}

export type MenuRadioGroupContext = {
  readonly value: MenuValue | undefined
  readonly disabled: boolean
  select: (value: MenuValue) => void
}

const MENU_CONTEXT = Symbol.for('litho.menu')
const MENU_RADIO_GROUP_CONTEXT = Symbol.for('litho.menu-radio-group')

export function setMenuContext(context: MenuContext) {
  setContext(MENU_CONTEXT, context)
}

export function getMenuContext() {
  return getContext<MenuContext | undefined>(MENU_CONTEXT)
}

export function setMenuRadioGroupContext(
  context: MenuRadioGroupContext,
) {
  setContext(MENU_RADIO_GROUP_CONTEXT, context)
}

export function getMenuRadioGroupContext() {
  return getContext<MenuRadioGroupContext | undefined>(
    MENU_RADIO_GROUP_CONTEXT,
  )
}
