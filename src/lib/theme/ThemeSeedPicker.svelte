<script lang="ts">
  import ButtonGroup from '../ButtonGroup.svelte'
  import GhostButton from '../GhostButton.svelte'
  import IconButton from '../IconButton.svelte'
  import TextField from '../TextField.svelte'
  import Tooltip from '../Tooltip.svelte'
  import { themeConfig, type ThemeMode } from './config'
  import { getThemeConfig, updateTheme } from './index'

  const initialConfig = getThemeConfig()

  let seed = initialConfig.seed
  let seedInput: string = seed
  let mode = initialConfig.mode
  let invalid = false

  const modes: Array<{ value: ThemeMode; label: string; icon: string }> = [
    { value: 'system', label: 'System', icon: 'monitor' },
    { value: 'light', label: 'Light', icon: 'sun' },
    { value: 'dark', label: 'Dark', icon: 'moon' },
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

    <div class="appearance-control">
      <span class="control-label">Appearance</span>
      <ButtonGroup
        class="theme-mode-group"
        mode="options"
        value={mode}
        aria-label="Appearance"
      >
        {#each modes as option}
          <Tooltip content={option.label}>
            <IconButton
              icon={option.icon}
              label={`Use ${option.label.toLowerCase()} appearance`}
              value={option.value}
              onclick={() => applyMode(option.value)}
            />
          </Tooltip>
        {/each}
      </ButtonGroup>
    </div>
  </div>

  <div class="palette" aria-label="Generated color preview">
    <span class="primary" title="Primary"></span>
    <span class="secondary" title="Secondary"></span>
    <span class="tertiary" title="Tertiary"></span>
    <span class="surface" title="Surface"></span>
  </div>
</section>

<style>
  .theme-seed-picker {
    width: min(var(--lds-theme-picker-width), calc(100vw - 2rem));
    padding: var(--lds-theme-picker-padding);
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
    gap: var(--lds-theme-picker-header-gap);
  }

  .eyebrow,
  h2 {
    margin: 0;
  }

  .eyebrow,
  .control-label {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--lds-theme-picker-meta-font-size);
  }

  .eyebrow {
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h2 {
    font-family: var(--heading);
    font-size: var(--lds-theme-picker-title-font-size);
    font-weight: 500;
    line-height: 1.25;
  }

  .seed-control {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: var(--lds-theme-picker-control-gap);
    margin-block: var(--lds-theme-picker-control-margin-block);
    align-items: stretch;
  }

  .color-control {
    display: grid;
    gap: var(--lds-field-gap);
  }

  .appearance-control {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    align-content: stretch;
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

  :global(.picker-reset) {
    min-height: var(--lds-control-min-height-compact);
    padding-inline: var(--lds-theme-picker-reset-padding-inline);
    font-size: var(--lds-theme-picker-reset-font-size);
  }

  :global(.seed-hex-field .lds-text-field__input) {
    font-family: var(--mono);
  }

  :global(.theme-mode-group) {
    align-self: center;
  }

  .palette {
    display: flex;
    height: var(--lds-theme-picker-palette-height);
    margin-top: var(--lds-theme-picker-palette-margin-block-start);
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

  @media (max-width: 20rem) {
    .seed-control {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .appearance-control {
      grid-column: 1 / -1;
      justify-self: end;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .color-input {
      transition: none;
    }
  }
</style>
