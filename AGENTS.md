# Litho Design System Notes

## Product direction

- Litho is a productivity-oriented design language: high information density
  with a calm, polished visual experience.
- Prefer low-saturation, low-contrast chrome. Reserve stronger contrast for
  readable content and important state feedback.
- The density principle is "compact at the control level, breathable at the
  layout level."
- Material Color Utilities provide the dynamic color foundation, but Litho's
  component semantics and motion language are intentionally its own.

## Stack and theme architecture

- Svelte 5 runes, TypeScript, Tailwind CSS 4, and
  `@material/material-color-utilities`; GitLab's MIT-licensed
  `@gitlab/svgs` supplies the icon sprite.
- `src/lib/theme/materialTokens.css` is the first-paint and IDE fallback.
- Runtime seed changes are handled by `materialTheme.ts`; preserve HMR for
  theme configuration.
- Put reusable reference and semantic tokens in `tokens.css`. Component state
  styling currently lives in `styles.css`.

## Current component foundation

- Buttons: Primary, Tonal, Ghost, IconButton, and ButtonGroup.
- Inputs: Checkbox, TextField, Select, and searchable Combobox. TextField,
  Select, and Combobox share FieldShell.
- Dense action primitives: Icon, Tooltip, Toolbar, and ToolbarSeparator.
- ThemeSeedPicker is built from Litho controls and remains the live dynamic
  color probe.
- App.svelte is the component lab and manual visual-regression surface.

## Intentional interaction decisions

- Standard desktop controls use a 38px minimum height. Compact IconButton uses
  32px; all controls expand to at least 44px for coarse pointers.
- PrimaryButton is expressive by default: its standalone hover may add a light
  border and slightly change size. `expressive={false}` opts into the quiet
  Tonal-like behavior. ButtonGroup disables expressive behavior automatically.
- TonalButton and GhostButton do not expand on hover. Their hover shape becomes
  softer; pressed behavior still scales down.
- Standalone GhostButton deliberately uses a slow ambient shape transition to
  emphasize contraction. Inside ButtonGroup it uses TonalButton's fast speed.
- ButtonGroup dividers are independent, zero-width overlay elements. Do not
  attach them to a button transform or give them layout width.
- ButtonGroup pressed shape must win over its zero-radius and first/last-radius
  layout rules, including when a compact button is wrapped by Tooltip.
- Disabled controls must not react to hover or active states.
- Tooltip uses Tonal colors and backdrop blur. Pointer hover is delayed,
  keyboard focus opens immediately, and Escape dismisses it. Its fixed-position
  surface flips at viewport edges while its arrow continues to track the
  trigger center.
- Tooltip reveal expands only its surface horizontally. Text keeps its natural
  proportions and is revealed by clipping; the arrow is never scaled.
- Toolbar is one Tab stop with roving focus. Horizontal toolbars use Left/Right,
  vertical toolbars use Up/Down, and Home/End jump to boundaries. Nested
  composites that call `preventDefault()` keep ownership of their key event.
- Toolbar does not clip focus outlines. Toolbar GhostButton motion uses the
  faster grouped-control timing, and ToolbarSeparator infers the visual
  orientation from its Toolbar.
- Readonly TextField remains focusable/selectable but has no special focus
  border, glow, or radius.
- `commitOnEnter` on TextField must ignore IME composition, briefly show the
  pressed state, then blur.
- Error TextField hover uses `--color-lds-field-error-highlighted`.
- FieldShell owns label, required marker, support/error copy, compact density,
  and merged `aria-describedby` / `aria-invalid` wiring. Input components keep
  their own native semantics and interaction logic.
- Select uses the same custom ListboxPopup as Combobox so both share shape and
  motion. A visually hidden native `<select>` remains responsible for form
  submission and required validation.
- ListboxPopup connects directly to the field control. Its surface reveals
  downward from a fixed top edge using a dedicated 300ms duration and Tooltip's
  reveal easing; option
  content stays at natural size and is revealed only through clipping. The
  field control paints above the popup, and the field keeps its elevated layer
  until the shorter reverse collapse transition completes; only then restore
  the control's bottom corners with its normal fast shape transition. The popup
  matches the field body's exact width, begins at `top: 100%` without
  translucent overlap, omits its top border, and reuses Tooltip's Tonal
  surface, border, shadow, and backdrop treatment.
- Combobox opens the complete option set on focus, filters only after the user
  types, keeps DOM focus on its input, and uses `aria-activedescendant`.
  Arrow/Home/End navigate enabled options, Enter selects outside IME
  composition, and Escape restores the committed selection. Required
  Comboboxes must validate the committed option value, not merely non-empty
  query text.

## Component conventions

- Preserve native element attributes and consumer event handlers.
- A consumer calling `preventDefault()` should be able to veto compound
  component behavior.
- Prefer semantic HTML and visible focus states.
- ButtonGroup `actions` contains independent commands. `options` maintains one
  selected value, exposes `aria-pressed`, supports `bind:value`, and handles
  arrow/Home/End navigation.
- IconButton requires an accessible `label`; its GitLab glyph remains
  decorative. It supports `ghost`, `tonal`, and `primary`, plus `compact` and
  `default` sizes.
- Tooltip should wrap one focusable trigger. Preserve the trigger's existing
  `aria-describedby` values when adding or removing the tooltip description.
- Toolbar must restore consumer tabindex attributes when it is destroyed and
  skip disabled, hidden, nested-toolbar, and explicit `tabindex="-1"` items.
- Select and Combobox share `ListboxOption` (`value`, `label`, optional
  `disabled` and `keywords`) and support `bind:value`. Combobox selection
  changes also expose `onvaluechange`.
- Reuse Litho controls in internal tools such as ThemeSeedPicker. Keep native
  controls only where they provide unique platform behavior, such as
  `<input type="color">`.

## Working rules

- Preserve intentional user changes and unrelated worktree modifications.
- Add tokens for reusable design decisions; avoid one-off state colors and
  motion constants in component markup.
- Check desktop, coarse-pointer, disabled, readonly, error, keyboard, and
  reduced-motion states when changing a control.
- Validate changes with:

  ```powershell
  npm.cmd run check
  npm.cmd run build
  ```

## Suggested roadmap

1. Add Radio/Switch where ButtonGroup or Checkbox semantics are insufficient.
2. Build compact List primitives and integrate them with Toolbar in a realistic
   productivity layout.
3. Add DataTable primitives to stress density, selection, keyboard navigation,
   and overflow behavior.
4. Add component-level interaction tests and screenshot regression coverage.
5. Revisit GitLab-style animated icons later; do not add the Vue-based
   `@gitlab/ui` dependency merely for them.
