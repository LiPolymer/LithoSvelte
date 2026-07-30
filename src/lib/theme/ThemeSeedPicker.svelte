<script lang="ts">
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

    <button class="reset" type="button" onclick={reset}>Reset</button>
  </header>

  <div class="seed-control">
    <input
      class="color-input"
      type="color"
      value={seed}
      aria-label="Choose Material seed color"
      oninput={(event) => applySeed(event.currentTarget.value)}
    />

    <label>
      <span>Hex</span>
      <input
        class:invalid
        type="text"
        value={seedInput}
        maxlength="7"
        spellcheck="false"
        aria-invalid={invalid}
        oninput={(event) => applySeed(event.currentTarget.value)}
        onblur={() => {
          if (invalid) {
            seedInput = seed
            invalid = false
          }
        }}
      />
    </label>
  </div>

  <fieldset>
    <legend>Appearance</legend>
    <div class="mode-switch">
      {#each modes as option}
        <button
          type="button"
          class:active={mode === option.value}
          aria-pressed={mode === option.value}
          onclick={() => applyMode(option.value)}
        >
          {option.label}
        </button>
      {/each}
    </div>
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
    padding: 0.8rem;
    border: 0.15rem solid var(--color-lds-primary-border-light);
    border-radius: 0.3em;
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
  .mode-switch,
  .palette {
    display: flex;
    align-items: center;
  }

  header {
    justify-content: space-between;
    gap: 1rem;
  }

  .eyebrow,
  h2,
  legend {
    margin: 0;
  }

  .eyebrow,
  label span,
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

  button,
  input {
    font: inherit;
  }

  button {
    color: inherit;
    cursor: pointer;
  }

  .reset {
    padding: 0.35rem 0.55rem;
    border: 0;
    border-radius: 0.2em;
    color: var(--md-sys-color-primary);
    background: transparent;
    font-size: 0.75rem;
  }

  .reset:hover {
    background: var(--color-lds-state-hover);
  }

  .seed-control {
    gap: 0.75rem;
    margin-block: 0.8rem;
  }

  .color-input {
    width: 2.6rem;
    height: 2.6rem;
    padding: 0;
    overflow: hidden;
    border: 0.1rem solid var(--md-sys-color-outline-variant);
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
  }

  .color-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-input::-webkit-color-swatch {
    border: 0;
    border-radius: 50%;
  }

  .color-input::-moz-color-swatch {
    border: 0;
    border-radius: 50%;
  }

  label {
    display: grid;
    flex: 1;
    gap: 0.2rem;
  }

  label input {
    min-width: 0;
    padding: 0.4rem 0.55rem;
    border: 0.1rem solid transparent;
    border-radius: 0.2em;
    color: var(--md-sys-color-on-surface);
    background:
      color-mix(
        in srgb,
        var(--md-sys-color-primary) 5%,
        var(--md-sys-color-surface)
      );
    font-family: var(--mono);
    font-size: 0.85rem;
  }

  label input.invalid {
    border-color: var(--md-sys-color-error);
    outline-color: var(--md-sys-color-error);
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

  .mode-switch {
    gap: 0.15rem;
    padding: 0.15rem;
    border-radius: 0.25em;
    background:
      color-mix(
        in srgb,
        var(--md-sys-color-secondary) 7%,
        transparent
      );
  }

  .mode-switch button {
    flex: 1;
    padding: 0.4rem 0.45rem;
    border: 0;
    border-radius: 0.15em;
    color: var(--md-sys-color-on-surface-variant);
    background: transparent;
    font-size: 0.8rem;
  }

  .mode-switch button:hover {
    color: var(--md-sys-color-secondary);
    background: var(--color-lds-secondary);
  }

  .mode-switch button.active {
    color: var(--color-lds-secondary-content);
    background: var(--color-lds-secondary-hover);
  }

  .palette {
    height: 0.4rem;
    margin-top: 0.8rem;
    overflow: hidden;
    border-radius: 0.1em;
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

  button,
  input {
    transition:
      color 100ms ease-out,
      background-color 100ms ease-out,
      border-color 100ms ease-out,
      border-radius 100ms cubic-bezier(0.25, 1, 0.5, 1);
  }

  button:focus-visible,
  input:focus-visible {
    outline: 0.1rem solid
      color-mix(in srgb, var(--md-sys-color-primary) 45%, transparent);
    outline-offset: 0.15rem;
  }

  @media (prefers-reduced-motion: reduce) {
    button,
    input {
      transition: none;
    }
  }
</style>
