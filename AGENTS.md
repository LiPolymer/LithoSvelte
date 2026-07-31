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
  `@material/material-color-utilities`.
- `src/lib/theme/materialTokens.css` is the first-paint and IDE fallback.
- Runtime seed changes are handled by `materialTheme.ts`; preserve HMR for
  theme configuration.
- Put reusable reference and semantic tokens in `tokens.css`. Component state
  styling currently lives in `styles.css`.

## Intentional interaction decisions

- Desktop controls use a compact 38px minimum height; coarse pointers use 44px.
- PrimaryButton is expressive by default: its standalone hover may add a light
  border and slightly change size. `expressive={false}` opts into the quiet
  Tonal-like behavior. ButtonGroup disables expressive behavior automatically.
- TonalButton and GhostButton do not expand on hover. Their hover shape becomes
  softer; pressed behavior still scales down.
- Standalone GhostButton deliberately uses a slow ambient shape transition to
  emphasize contraction. Inside ButtonGroup it uses TonalButton's fast speed.
- ButtonGroup dividers are independent, zero-width overlay elements. Do not
  attach them to a button transform or give them layout width.
- Disabled controls must not react to hover or active states.
- Readonly TextField remains focusable/selectable but has no special focus
  border, glow, or radius.
- `commitOnEnter` on TextField must ignore IME composition, briefly show the
  pressed state, then blur.
- Error TextField hover uses `--color-lds-field-error-highlighted`.

## Component conventions

- Preserve native element attributes and consumer event handlers.
- A consumer calling `preventDefault()` should be able to veto compound
  component behavior.
- Prefer semantic HTML and visible focus states.
- ButtonGroup `actions` contains independent commands. `options` maintains one
  selected value, exposes `aria-pressed`, supports `bind:value`, and handles
  arrow/Home/End navigation.
- Reuse Litho controls in internal tools such as ThemeSeedPicker. Keep native
  controls only where they provide unique platform behavior, such as
  `<input type="color">`.
- App.svelte is the component lab and manual visual-regression surface.

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

1. Add an icon foundation, IconButton, and Tooltip for dense toolbars.
2. Add Select/Combobox and its shared field shell.
3. Add Radio/Switch where ButtonGroup or Checkbox semantics are insufficient.
4. Build Toolbar, compact List, and DataTable primitives to test the system in
   realistic productivity layouts.
5. Add component-level interaction tests and screenshot regression coverage.
