<script lang="ts">
  import ButtonGroup from '../ButtonGroup.svelte'
  import GhostButton from '../GhostButton.svelte'
  import TextField from '../TextField.svelte'
  import { themeConfig, type ThemeMode } from './config'
  import { getThemeConfig, updateTheme } from './index'

  const initialConfig = getThemeConfig()

  let seed = initialConfig.seed
  let seedInput: string = seed
  let mode = initialConfig.mode
  let invalid = false

  const modes: Array<{ value: ThemeMode; label: string }> = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ]

  function normalizeHex(value: string): `#${string}` | undefined {
    const match = value.trim().match(/^#?([0-9a-f]{6})$/i)
    return match ? `#${match[1].toLowerCase()}` : undefined
  }

  function applySeed(value: string): void {
    seedInput = value

    const nextSeed = normalizeHex(value)
    invalid = nextSeed === undefined

    if (!nextSeed) return

    seed = nextSeed
    seedInput = nextSeed
    updateTheme({ seed: nextSeed })
  }

  function applyMode(nextMode: ThemeMode): void {
    mode = nextMode
    updateTheme({ mode: nextMode })
  }

  function reset(): void {
    seed = themeConfig.seed
    seedInput = themeConfig.seed
    mode = themeConfig.mode
    invalid = false
    updateTheme({ ...themeConfig })
  }
</script>

<section class="theme-seed-picker" aria-labelledby="theme-seed-title">
  <header>
    <div>
      <p class="eyebrow">Material theme</p>
      <h2 id="theme-seed-title">Seed color</h2>
    </div>

    <GhostButton class="picker-reset" onclick={reset}>Reset</GhostButton>
  </header>

  <div class="seed-control">
    <label class="color-control">
      <span class="control-label">Color</span>
      <input
        class="color-input"
        type="color"
        value={seed}
        aria-label="Choose Material seed color"
        oninput={(event) => applySeed(event.currentTarget.value)}
      />
    </label>

    <TextField
      class="seed-hex-field"
      label="Hex"
      bind:value={seedInput}
      error={invalid ? 'Enter a six-digit hex color.' : undefined}
      maxlength={7}
      spellcheck={false}
      commitOnEnter
      oninput={(event) => applySeed(event.currentTarget.value)}
      onblur={() => {
        if (invalid) {
          seedInput = seed
          invalid = false
        }
      }}
    />
  </div>

  <fieldset>
    <legend>Appearance</legend>
    <ButtonGroup
      class="theme-mode-group"
      mode="options"
      value={mode}
      aria-label="Theme appearance"
    >
      {#each modes as option}
        <GhostButton
          value={option.value}
          onclick={() => applyMode(option.value)}
        >
          {option.label}
        </GhostButton>
      {/each}
    </ButtonGroup>
  </fieldset>

  <div class="palette" aria-label="Generated color preview">
    <span class="primary" title="Primary"></span>
    <span class="secondary" title="Secondary"></span>
    <span class="tertiary" title="Tertiary"></span>
    <span class="surface" title="Surface"></span>
  </div>
</section>

<style>
  .theme-seed-picker {
    width: min(18rem, calc(100vw - 2rem));
    padding: 0.75rem;
    border: 0.15rem solid var(--color-lds-primary-border-light);
    border-radius: var(--radius-lds-md);
    color: var(--md-sys-color-on-surface);
    background:
      color-mix(
        in srgb,
        var(--md-sys-color-primary) 4%,
        var(--md-sys-color-surface)
      );
  }

  header,
  .seed-control,
  .palette {
    align-items: center;
  }

  header {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .eyebrow,
  h2,
  legend {
    margin: 0;
  }

  .eyebrow,
  .control-label,
  legend {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.75rem;
  }

  .eyebrow {
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h2 {
    font-family: var(--heading);
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.25;
  }

  .seed-control {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.5rem;
    margin-block: 0.75rem;
    align-items: start;
  }

  .color-control {
    display: grid;
    gap: var(--lds-field-gap);
  }

  .control-label {
    padding-inline: 0.1rem;
    font-weight: 500;
  }

  .color-input {
    width: var(--lds-control-min-height);
    height: var(--lds-control-min-height);
    padding: 0;
    overflow: hidden;
    border: 0.1rem solid
      color-mix(
        in srgb,
        var(--md-sys-color-outline-variant) 65%,
        transparent
      );
    border-radius: var(--lds-shape-rest);
    background: transparent;
    cursor: pointer;
    transition:
      border-radius var(--lds-motion-duration-fast)
        var(--lds-motion-easing-shape),
      border-color var(--lds-motion-duration-fast)
        var(--lds-motion-easing-state),
      transform var(--lds-motion-duration-fast)
        var(--lds-motion-easing-spring);
  }

  .color-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-input::-webkit-color-swatch {
    border: 0;
    border-radius: calc(var(--lds-shape-rest) - 0.05rem);
  }

  .color-input::-moz-color-swatch {
    border: 0;
    border-radius: calc(var(--lds-shape-rest) - 0.05rem);
  }

  .color-input:hover {
    border-color:
      color-mix(in srgb, var(--md-sys-color-primary) 45%, transparent);
    border-radius: var(--lds-shape-hover-compact);
  }

  .color-input:active {
    border-radius: var(--lds-shape-pressed);
    transform: scale(0.95);
  }

  .color-input:focus-visible {
    outline: 0.1rem solid
      color-mix(in srgb, var(--md-sys-color-primary) 45%, transparent);
    outline-offset: 0.15rem;
  }

  fieldset {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  legend {
    margin-bottom: 0.35rem;
  }

  :global(.picker-reset) {
    min-height: 2rem;
    padding-inline: 0.55rem;
    font-size: 0.75rem;
  }

  :global(.seed-hex-field .lds-text-field__input) {
    font-family: var(--mono);
  }

  :global(.theme-mode-group) {
    width: 100%;
  }

  :global(.theme-mode-group > .lds-btn) {
    flex: 1;
  }

  .palette {
    display: flex;
    height: 0.4rem;
    margin-top: 0.75rem;
    overflow: hidden;
    border-radius: var(--radius-lds-xs);
  }

  .palette span {
    flex: 1;
    align-self: stretch;
  }

  .primary {
    background: var(--md-sys-color-primary);
  }

  .secondary {
    background: var(--md-sys-color-secondary);
  }

  .tertiary {
    background: var(--md-sys-color-tertiary);
  }

  .surface {
    background: var(--md-sys-color-surface);
  }

  @media (pointer: coarse) {
    .color-input {
      width: var(--lds-control-min-height-touch);
      height: var(--lds-control-min-height-touch);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .color-input {
      transition: none;
    }
  }
</style>
