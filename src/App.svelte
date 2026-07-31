<script lang="ts">
  import ButtonGroup from './lib/ButtonGroup.svelte'
  import Checkbox from './lib/Checkbox.svelte'
  import GhostButton from './lib/GhostButton.svelte'
  import IconButton from './lib/IconButton.svelte'
  import PrimaryButton from './lib/PrimaryButton.svelte'
  import TextField from './lib/TextField.svelte'
  import Tooltip from './lib/Tooltip.svelte'
  import TonalButton from './lib/TonalButton.svelte'
  import ThemeSeedPicker from './lib/theme/ThemeSeedPicker.svelte'

  let expressiveMotion = false
  let notifications = true
  let displayName = ''
  let email = 'hello@litho.design'
  let viewMode: string | number = 'list'
  let lastAction = 'Nothing yet'
</script>

<svelte:head>
  <title>Litho · Component Lab</title>
</svelte:head>

<div class="lab-shell">
  <header class="lab-header">
    <p class="lab-kicker">Design system / Component lab</p>
    <h1>Litho.</h1>
    <p class="lab-intro">
      Low-contrast controls, readable content and expressive shape motion.
    </p>
  </header>

  <div class="lab-layout">
    <main class="lab-content">
      <section class="lab-section" aria-labelledby="button-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">01 / Actions</p>
            <h2 id="button-lab-title">Buttons</h2>
          </div>
          <p>Compare interaction states across the three emphasis levels.</p>
        </div>

        <div class="state-table-scroll">
          <table class="state-table">
            <thead>
              <tr>
                <th scope="col">Variant</th>
                <th scope="col">Rest</th>
                <th scope="col">Hover</th>
                <th scope="col">Focus</th>
                <th scope="col">Pressed</th>
                <th scope="col">Disabled</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Primary</th>
                <td><PrimaryButton>Primary</PrimaryButton></td>
                <td class="forced-state">
                  <PrimaryButton data-demo-state="hover">Primary</PrimaryButton>
                </td>
                <td class="forced-state">
                  <PrimaryButton data-demo-state="focus">Primary</PrimaryButton>
                </td>
                <td class="forced-state">
                  <PrimaryButton data-demo-state="pressed">Primary</PrimaryButton>
                </td>
                <td><PrimaryButton disabled>Primary</PrimaryButton></td>
              </tr>
              <tr>
                <th scope="row">Tonal</th>
                <td><TonalButton>Tonal</TonalButton></td>
                <td class="forced-state">
                  <TonalButton data-demo-state="hover">Tonal</TonalButton>
                </td>
                <td class="forced-state">
                  <TonalButton data-demo-state="focus">Tonal</TonalButton>
                </td>
                <td class="forced-state">
                  <TonalButton data-demo-state="pressed">Tonal</TonalButton>
                </td>
                <td><TonalButton disabled>Tonal</TonalButton></td>
              </tr>
              <tr>
                <th scope="row">Ghost</th>
                <td><GhostButton>Ghost</GhostButton></td>
                <td class="forced-state">
                  <GhostButton data-demo-state="hover">Ghost</GhostButton>
                </td>
                <td class="forced-state">
                  <GhostButton data-demo-state="focus">Ghost</GhostButton>
                </td>
                <td class="forced-state">
                  <GhostButton data-demo-state="pressed">Ghost</GhostButton>
                </td>
                <td><GhostButton disabled>Ghost</GhostButton></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="button-group-grid">
          <article>
            <span>Actions / related commands</span>
            <ButtonGroup aria-label="File actions">
              <PrimaryButton
                expressive={false}
                onclick={() => (lastAction = 'Download')}
              >
                Download
              </PrimaryButton>
              <TonalButton onclick={() => (lastAction = 'Browse')}>
                Browse
              </TonalButton>
              <GhostButton onclick={() => (lastAction = 'Delete')}>
                Delete
              </GhostButton>
            </ButtonGroup>
            <small>Last action: {lastAction}</small>
          </article>

          <article>
            <span>Options / one active view</span>
            <ButtonGroup
              mode="options"
              bind:value={viewMode}
              aria-label="View mode"
            >
              <GhostButton value="list">List</GhostButton>
              <GhostButton value="board">Board</GhostButton>
              <GhostButton value="timeline">Timeline</GhostButton>
            </ButtonGroup>
            <small>Current view: {viewMode}</small>
          </article>
        </div>

        <div class="icon-button-lab">
          <div>
            <span>Icon buttons / compact actions</span>
            <small>GitLab glyphs with Litho density and interaction states.</small>
          </div>

          <div class="icon-button-rows">
            <div
              class="icon-button-row"
              role="group"
              aria-label="Icon button variants"
            >
              <Tooltip content="Edit">
                <IconButton icon="pencil" label="Edit" />
              </Tooltip>
              <Tooltip content="Download" placement="bottom">
                <IconButton
                  icon="download"
                  label="Download"
                  variant="tonal"
                />
              </Tooltip>
              <Tooltip content="Create">
                <IconButton icon="plus" label="Create" variant="primary" />
              </Tooltip>
              <Tooltip content="Remove unavailable">
                <IconButton icon="remove" label="Remove" disabled />
              </Tooltip>
              <Tooltip content="Settings">
                <IconButton icon="settings" label="Settings" size="default" />
              </Tooltip>
            </div>

            <ButtonGroup aria-label="Formatting actions">
              <Tooltip content="Bold">
                <IconButton icon="bold" label="Bold" />
              </Tooltip>
              <Tooltip content="Italic">
                <IconButton icon="italic" label="Italic" />
              </Tooltip>
              <Tooltip content="Insert link">
                <IconButton icon="link" label="Insert link" />
              </Tooltip>
            </ButtonGroup>
          </div>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="checkbox-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">02 / Selection</p>
            <h2 id="checkbox-lab-title">Checkbox</h2>
          </div>
          <p>Click or use the keyboard to inspect its real interaction states.</p>
        </div>

        <div class="checkbox-grid">
          <article>
            <span>Interactive / unchecked</span>
            <Checkbox bind:checked={expressiveMotion}>
              Expressive motion
            </Checkbox>
          </article>

          <article>
            <span>Interactive / checked</span>
            <Checkbox bind:checked={notifications}>
              Notifications
            </Checkbox>
          </article>

          <article>
            <span>Disabled / unchecked</span>
            <Checkbox disabled>
              Expressive motion
            </Checkbox>
          </article>

          <article>
            <span>Disabled / checked</span>
            <Checkbox checked disabled>
              Notifications
            </Checkbox>
          </article>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="text-field-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">03 / Input</p>
            <h2 id="text-field-lab-title">Text field</h2>
          </div>
          <p>Probe content hierarchy, focus, errors and non-editable states.</p>
        </div>

        <div class="text-field-grid">
          <article>
            <span>Default / empty</span>
            <TextField
              label="Display name"
              placeholder="Lithium Fish"
              helperText="Press Enter to commit and release focus."
              commitOnEnter
              bind:value={displayName}
            />
          </article>

          <article>
            <span>Default / filled</span>
            <TextField
              label="Email"
              type="email"
              helperText="Used for account notifications."
              bind:value={email}
            />
          </article>

          <article>
            <span>Error</span>
            <TextField
              label="Email"
              type="email"
              value="not-an-email"
              error="Enter a valid email address."
              required
            />
          </article>

          <article>
            <span>Readonly</span>
            <TextField
              label="Theme source"
              value="Material seed color"
              helperText="Generated by the active theme."
              readonly
            />
          </article>

          <article>
            <span>Disabled</span>
            <TextField
              label="Workspace"
              value="Unavailable"
              helperText="This field cannot be edited."
              disabled
            />
          </article>
        </div>
      </section>
    </main>

    <aside class="theme-dock" aria-label="Theme controls">
      <ThemeSeedPicker />
      <p>
        Change the seed or appearance mode to probe every component state.
      </p>
    </aside>
  </div>
</div>

<style>
  .lab-shell {
    width: min(92rem, 100%);
    min-height: 100dvh;
    margin-inline: auto;
    padding: clamp(1.25rem, 4vw, 4rem);
    color: var(--md-sys-color-on-surface);
  }

  .lab-header {
    max-width: 54rem;
    margin-bottom: clamp(3rem, 8vw, 7rem);
  }

  .lab-kicker,
  .section-index,
  .section-heading > p,
  .theme-dock > p,
  .button-group-grid article > span,
  .button-group-grid article > small,
  .icon-button-lab span,
  .icon-button-lab small,
  .checkbox-grid article > span,
  .text-field-grid article > span {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.75rem;
  }

  .lab-kicker,
  .section-index {
    margin: 0;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h1,
  h2,
  p {
    margin: 0;
  }

  h1 {
    margin-block: 0.1em;
    font-family: var(--heading);
    font-size: clamp(4.5rem, 12vw, 9rem);
    font-weight: 500;
    line-height: 0.95;
    letter-spacing: -0.055em;
  }

  .lab-intro {
    max-width: 34rem;
    color: var(--md-sys-color-on-surface-variant);
  }

  .lab-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: clamp(1.5rem, 4vw, 4rem);
    align-items: start;
  }

  .lab-content {
    display: grid;
    min-width: 0;
    gap: 1rem;
  }

  .lab-section {
    min-width: 0;
    padding: clamp(1rem, 2.5vw, 2rem);
    border: 0.15rem solid var(--color-lds-primary-border-light);
    border-radius: var(--radius-lds-md);
    background:
      color-mix(
        in srgb,
        var(--md-sys-color-primary) 2%,
        var(--md-sys-color-surface)
      );
  }

  .section-heading {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .section-heading h2 {
    margin-top: 0.15em;
    font-family: var(--heading);
    font-size: clamp(1.75rem, 4vw, 3rem);
    font-weight: 500;
    line-height: 1;
  }

  .section-heading > p {
    max-width: 20rem;
    text-align: right;
  }

  .state-table-scroll {
    overflow-x: auto;
    padding: 0.25rem;
    margin: -0.25rem;
  }

  .state-table {
    width: 100%;
    min-width: 48rem;
    border-spacing: 0;
    border-collapse: separate;
  }

  .state-table th,
  .state-table td {
    padding: 0.8rem;
    border-bottom: 1px solid
      color-mix(
        in srgb,
        var(--md-sys-color-outline-variant) 45%,
        transparent
      );
    text-align: left;
  }

  .state-table thead th,
  .state-table tbody th {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .state-table tbody tr:last-child th,
  .state-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .forced-state :global([data-demo-state]) {
    pointer-events: none;
  }

  .checkbox-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .button-group-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .icon-button-lab {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 1rem;
    margin-top: 0.5rem;
    padding: 1rem;
    border-radius: var(--radius-lds-sm);
    background:
      color-mix(
        in srgb,
        var(--md-sys-color-secondary) 5%,
        transparent
      );
  }

  .icon-button-lab > div:first-child {
    display: grid;
    gap: 0.2rem;
  }

  .icon-button-rows,
  .icon-button-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .icon-button-rows {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .text-field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .button-group-grid article {
    display: grid;
    min-width: 0;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: var(--radius-lds-sm);
    background:
      color-mix(
        in srgb,
        var(--md-sys-color-secondary) 5%,
        transparent
      );
  }

  .checkbox-grid article {
    display: grid;
    gap: 1rem;
    min-height: 7rem;
    padding: 1rem;
    border-radius: var(--radius-lds-sm);
    background:
      color-mix(
        in srgb,
        var(--md-sys-color-secondary) 5%,
        transparent
      );
  }

  .text-field-grid article {
    display: grid;
    gap: 1rem;
    min-height: 9rem;
    padding: 1rem;
    border-radius: var(--radius-lds-sm);
    background:
      color-mix(
        in srgb,
        var(--md-sys-color-secondary) 5%,
        transparent
      );
  }

  .checkbox-grid article > span {
    align-self: start;
  }

  .text-field-grid article > span {
    align-self: start;
  }

  .checkbox-grid article :global(.lds-checkbox) {
    align-self: end;
    justify-self: start;
  }

  .button-group-grid article :global(.lds-button-group) {
    align-self: end;
  }

  .text-field-grid article :global(.lds-text-field) {
    align-self: end;
  }

  .theme-dock {
    position: sticky;
    top: 1rem;
    display: grid;
    gap: 0.75rem;
    width: min-content;
  }

  .theme-dock > p {
    max-width: 18rem;
    padding-inline: 0.25rem;
  }

  @media (max-width: 62rem) {
    .lab-layout {
      grid-template-columns: minmax(0, 1fr);
    }

    .theme-dock {
      position: static;
      grid-row: 1;
      width: auto;
    }

    .theme-dock :global(.theme-seed-picker) {
      width: 100%;
    }

    .theme-dock > p {
      max-width: none;
    }
  }

  @media (max-width: 42rem) {
    .lab-header {
      margin-bottom: 2.5rem;
    }

    .section-heading {
      display: grid;
      gap: 0.75rem;
    }

    .section-heading > p {
      text-align: left;
    }

    .checkbox-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .button-group-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .icon-button-lab {
      display: grid;
      align-items: start;
    }

    .icon-button-rows {
      justify-content: flex-start;
    }

    .text-field-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
