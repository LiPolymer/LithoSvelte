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
- `src/lib/index.ts` is the stable TypeScript/component entry and
  `src/lib/styles.css` is the stable stylesheet entry. Keep implementation
  contexts and low-level overlay machinery out of the public barrel until
  their APIs are intentionally promoted.
- `src/lib/internal/overlay` owns portal transport, anchored floating
  positioning, and the shared overlay stack. It must remain appearance- and
  component-semantics-neutral.

## Current component foundation

- Buttons: Primary, Tonal, Ghost, IconButton, and ButtonGroup.
- Inputs: Checkbox, Radio/RadioGroup, Switch, TextField, Select, and searchable
  Combobox. TextField, Select, and Combobox share FieldShell.
- Dense action and collection primitives: Icon, Tooltip, Toolbar,
  ToolbarSeparator, List/ListItem, and DataTable/DataTableRow. DataTableSelectAll
  supplies its multiple-selection header control.
- Compact floating actions: Menu/MenuItem, MenuLabel, MenuSeparator,
  MenuCheckboxItem, and MenuRadioGroup/MenuRadioItem.
- FloatingLayer and Overlay are internal infrastructure used by Tooltip and
  Menu, and reserved for future Popover and Dialog components rather than
  consumer-facing components.
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
- Checkbox, Radio, and Switch share selection-control color, focus, density,
  and reduced-motion tokens while preserving their native inputs. Radio is an
  exclusive choice inside RadioGroup; Switch represents an immediate binary
  setting and exposes native checkbox semantics with `role="switch"`.
- Checkbox supports the native DOM `indeterminate` property and displays a
  mixed-state mark; use it for partial group selection rather than simulating
  the state with a decorative icon.
- Radio uses a diamond indicator with Checkbox's rest/hover/pressed corner
  sequence. Switch applies its hover-soft and pressed-tight shape changes to
  both the track and its thumb.
- Tooltip uses Tonal colors and backdrop blur. Pointer hover is delayed,
  keyboard focus opens immediately, and Escape dismisses it. Its fixed-position
  surface flips at viewport edges while its arrow continues to track the
  trigger center.
- Tooltip reveal expands only its surface horizontally. Text keeps its natural
  proportions and is revealed by clipping; the arrow is never scaled.
- Tooltip delegates fixed positioning to FloatingLayer. FloatingLayer portals
  its surface, flips and shifts at viewport edges, tracks the anchor through
  captured scroll/resize and ResizeObserver updates, and leaves visual motion
  to the owning component.
- Managed floating layers and overlays share one opening-order stack. Only the
  topmost managed overlay may handle Escape or outside-pointer dismissal.
  Overlay can restore the previously focused element and locks body scrolling
  while any modal layer is present. A consumer-provided `present` state may
  outlive `open` so exit motion can finish before unmounting.
- Menu is compact-first: desktop items use the 32px compact control height and
  coarse pointers expand them to 44px. Its surface reveals from the resolved
  anchor edge while item content keeps its natural proportions and is exposed
  through clipping.
- Menu opening is staged: mount the Overlay, invalidate any zero-size hidden
  measurement, wait for FloatingLayer to report a real position, then reveal
  on a later frame. Keep logical `open`, measured `positioned`, and visual
  `revealed` separate so the menu never paints at a stale coordinate.
- Menu owns one focusable trigger, restores the trigger's original ARIA
  attributes on teardown, and manages vertical focus with Up/Down, Home/End,
  and typeahead. ArrowDown opens at the first enabled item; ArrowUp opens at
  the last. Tab closes and advances relative to the trigger, while Escape,
  outside-pointer dismissal, and command selection return focus to it.
- Menu command items close after selection. Checkbox and radio items stay open
  by default so several display/sort options can be changed efficiently;
  `closeOnSelect` may override either behavior. Disabled items are skipped by
  keyboard navigation.
- Consecutive checked checkbox/radio menu items merge their touching corners
  into one compact selection block while retaining the outer group corners.
- Toolbar is one Tab stop with roving focus. Horizontal toolbars use Left/Right,
  vertical toolbars use Up/Down, and Home/End jump to boundaries. Nested
  composites that call `preventDefault()` keep ownership of their key event.
- Toolbar does not clip focus outlines. Toolbar GhostButton motion uses the
  faster grouped-control timing, and ToolbarSeparator infers the visual
  orientation from its Toolbar.
- Contextual Toolbars in ListItem and DataTableRow keep Toolbar's single Tab
  stop and arrow-key behavior, but remove shell gap/padding/layout border so
  their geometry matches a compact ButtonGroup. Their quiet shell border is an
  inset shadow, preventing hover/focus chrome from changing measured size.
  Each row variant has an end-margin token matched to its own top/bottom
  breathing room; do not reuse one inset across List and denser DataTable rows.
- List uses semantic `ul`/`li` structure with one row button and an optional
  sibling actions region. Up/Down and Home/End move the row roving focus;
  nested horizontal Toolbars retain Left/Right and their own Tab stop. List
  dividers belong to the `li`, so row-button press motion never transforms
  them. The dividers immediately before and after the selected row are hidden
  so they do not cut through its fill. A selected row uses TonalButton's quiet
  rest/hover-soft/pressed shape sequence and fast shape timing; keyboard focus
  alone does not soften its corners. Single-selection rows expose
  `aria-pressed` and support `bind:value`.
- DataTable preserves native table markup inside an overflow viewport. Enabled
  rows use one vertical roving-focus stop: Up/Down and Home/End move, Space
  toggles selection, and pointer selection focuses the row. Row checkboxes are
  pointer targets with `tabindex="-1"`; the focused row and its `aria-selected`
  state provide the efficient keyboard path. The select-all Checkbox remains a
  normal Tab stop and exposes checked/mixed/unchecked states. Disabled rows are
  skipped, nested controls keep their own keys, and row Toolbars remain one Tab
  stop each. Selected-row divider suppression and quiet Tonal-like corner
  treatment mirror Compact List.
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
- ListboxPopup intentionally stays inside FieldShell instead of being portaled:
  its exact shared width, joined border, and delayed corner restoration are
  part of the field geometry. Do not migrate it merely to make every popup use
  the same transport mechanism.
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
- Content rendered inside Overlay identifies its interactive surface with
  `data-lds-overlay-surface`; pointer events elsewhere in the overlay root are
  considered outside interactions. Dialog-specific role, initial focus, and
  focus containment belong to Dialog rather than the generic Overlay layer.
- Menu wraps exactly one focusable trigger, preferably a Litho button. Consumer
  trigger and item handlers run first; `preventDefault()` vetoes compound open,
  selection, or close behavior. MenuRadioItem must be nested in both Menu and
  MenuRadioGroup.
- Toolbar must restore consumer tabindex attributes when it is destroyed and
  skip disabled, hidden, nested-toolbar, and explicit `tabindex="-1"` items.
- Select and Combobox share `ListboxOption` (`value`, `label`, optional
  `disabled` and `keywords`) and support `bind:value`. Combobox selection
  changes also expose `onvaluechange`.
- Radio must be nested in RadioGroup. RadioGroup owns `name`, `required`,
  disabled/error support text, `bind:value`, and `onvaluechange`; native radio
  behavior retains browser arrow-key navigation and form submission.
- ListItem must be nested in List. Its leading snippet is decorative and must
  not contain interactive content; place independent commands in its actions
  snippet, preferably inside Toolbar.
- DataTableRow and DataTableSelectAll must be nested in DataTable. Multiple
  selection uses `bind:selected` with string/number row values. Interactive
  cell content is excluded from row-click selection; consumers may also call
  `preventDefault()` in a row handler to veto compound selection behavior.
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

1. Review the compact Menu prototype, then add nested submenus and a generic
   non-menu Popover only where real use cases require them.
2. Build Dialog/AlertDialog with their semantic roles, initial-focus policy,
   focus containment, and exit presence on top of Overlay.
3. Revisit GitLab-style animated icons later; do not add the Vue-based
   `@gitlab/ui` dependency merely for them.
