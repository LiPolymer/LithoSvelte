export type ListboxValue = string | number

export type ListboxOption = {
  value: ListboxValue
  label: string
  disabled?: boolean
  keywords?: readonly string[]
}
