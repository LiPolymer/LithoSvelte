<script lang="ts">
  import ButtonGroup from './lib/ButtonGroup.svelte'
  import Checkbox from './lib/Checkbox.svelte'
  import Combobox from './lib/Combobox.svelte'
  import GhostButton from './lib/GhostButton.svelte'
  import Icon from './lib/Icon.svelte'
  import IconButton from './lib/IconButton.svelte'
  import List from './lib/List.svelte'
  import ListItem from './lib/ListItem.svelte'
  import type { ListValue } from './lib/listContext'
  import type { ListboxOption, ListboxValue } from './lib/listbox'
  import PrimaryButton from './lib/PrimaryButton.svelte'
  import Radio from './lib/Radio.svelte'
  import RadioGroup from './lib/RadioGroup.svelte'
  import type { RadioValue } from './lib/radioGroupContext'
  import Select from './lib/Select.svelte'
  import Switch from './lib/Switch.svelte'
  import TextField from './lib/TextField.svelte'
  import Toolbar from './lib/Toolbar.svelte'
  import ToolbarSeparator from './lib/ToolbarSeparator.svelte'
  import Tooltip from './lib/Tooltip.svelte'
  import TonalButton from './lib/TonalButton.svelte'
  import ThemeSeedPicker from './lib/theme/ThemeSeedPicker.svelte'

  let expressiveMotion = false
  let notifications = true
  let displayName = ''
  let email = 'hello@litho.design'
  let viewMode: string | number = 'list'
  let lastAction = 'Nothing yet'
  let boldActive = true
  let italicActive = false
  let accessLevel: ListboxValue | undefined = 'maintainer'
  let invalidAccessLevel: ListboxValue | undefined
  let reviewer: ListboxValue | undefined = 'mira'
  let missingReviewer: ListboxValue | undefined
  let owner: ListboxValue | undefined = 'sora'
  let themeMode: RadioValue | undefined = 'system'
  let defaultVisibility: RadioValue | undefined
  let compactRows = true
  let liveSync = false
  let selectedWorkspace: ListValue | undefined = 'litho'
  let workspaceLayout: string | number = 'list'
  let workspaceActivity = 'Ready'

  const accessOptions: readonly ListboxOption[] = [
    { value: 'guest', label: 'Guest' },
    { value: 'reporter', label: 'Reporter' },
    { value: 'developer', label: 'Developer' },
    { value: 'maintainer', label: 'Maintainer' },
    { value: 'owner', label: 'Owner', disabled: true },
  ]

  const peopleOptions: readonly ListboxOption[] = [
    {
      value: 'mira',
      label: 'Mira Chen',
      keywords: ['design', 'taipei'],
    },
    {
      value: 'sora',
      label: 'Sora Kim',
      keywords: ['frontend', 'seoul'],
    },
    {
      value: 'niko',
      label: 'Niko Petrova',
      keywords: ['research', 'helsinki'],
    },
    {
      value: 'sam',
      label: 'Sam Rivera',
      keywords: ['platform', 'remote'],
    },
    {
      value: 'archived',
      label: 'Archived account',
      disabled: true,
    },
  ]
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

      <section class="lab-section" aria-labelledby="toolbar-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">02 / Composite actions</p>
            <h2 id="toolbar-lab-title">Toolbar</h2>
          </div>
          <p>One Tab stop, then arrow keys for efficient command navigation.</p>
        </div>

        <div class="toolbar-lab">
          <div>
            <span>Document formatting</span>
            <small>Home and End jump to the toolbar boundaries.</small>
          </div>

          <Toolbar aria-label="Document formatting">
            <Tooltip content="Undo">
              <IconButton icon="redo" label="Undo" class="toolbar-undo" />
            </Tooltip>
            <Tooltip content="Redo unavailable">
              <IconButton icon="redo" label="Redo" disabled />
            </Tooltip>

            <ToolbarSeparator />

            <ButtonGroup aria-label="Text formatting">
              <Tooltip content="Bold">
                <IconButton
                  icon="bold"
                  label="Bold"
                  aria-pressed={boldActive}
                  onclick={() => (boldActive = !boldActive)}
                />
              </Tooltip>
              <Tooltip content="Italic">
                <IconButton
                  icon="italic"
                  label="Italic"
                  aria-pressed={italicActive}
                  onclick={() => (italicActive = !italicActive)}
                />
              </Tooltip>
              <Tooltip content="Underline">
                <IconButton icon="underline" label="Underline" />
              </Tooltip>
            </ButtonGroup>

            <ToolbarSeparator />

            <Tooltip content="Insert link">
              <IconButton icon="link" label="Insert link" />
            </Tooltip>
            <Tooltip content="Add comment">
              <IconButton icon="comment" label="Add comment" />
            </Tooltip>
            <Tooltip content="More actions">
              <IconButton icon="ellipsis_h" label="More actions" />
            </Tooltip>
          </Toolbar>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="list-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">03 / Dense collections</p>
            <h2 id="list-lab-title">Compact list</h2>
          </div>
          <p>Vertical row navigation with independent actions at the edge.</p>
        </div>

        <div class="list-lab">
          <header class="list-lab-header">
            <div>
              <span>Recent workspaces</span>
              <small aria-live="polite">
                {selectedWorkspace ?? 'Nothing'} selected · {workspaceActivity}
              </small>
            </div>

            <Toolbar aria-label="Workspace list controls">
              <Tooltip content="Filter workspaces">
                <IconButton
                  icon="filter"
                  label="Filter workspaces"
                  onclick={() => (workspaceActivity = 'Filter opened')}
                />
              </Tooltip>
              <Tooltip content="Sort by recent activity">
                <IconButton
                  icon="sort-highest"
                  label="Sort by recent activity"
                  onclick={() => (workspaceActivity = 'Sorted by activity')}
                />
              </Tooltip>

              <ToolbarSeparator />

              <ButtonGroup
                mode="options"
                bind:value={workspaceLayout}
                aria-label="Workspace layout"
              >
                <Tooltip content="List layout">
                  <IconButton
                    icon="list-bulleted"
                    label="List layout"
                    value="list"
                  />
                </Tooltip>
                <Tooltip content="Table layout">
                  <IconButton icon="table" label="Table layout" value="table" />
                </Tooltip>
              </ButtonGroup>

              <ToolbarSeparator />

              <Tooltip content="Create workspace">
                <IconButton
                  icon="plus"
                  label="Create workspace"
                  variant="tonal"
                  onclick={() => (workspaceActivity = 'Create requested')}
                />
              </Tooltip>
            </Toolbar>
          </header>

          <List
            selectionMode="single"
            bind:value={selectedWorkspace}
            aria-label="Recent workspaces"
          >
            <ListItem
              value="litho"
              label="Litho design system"
              description="main · 12 local changes"
              metadata="4m"
              onclick={() => (workspaceActivity = 'Litho opened')}
            >
              {#snippet leading()}
                <Icon name="project" />
              {/snippet}
              {#snippet actions()}
                <Toolbar aria-label="Litho workspace actions">
                  <Tooltip content="Open activity">
                    <IconButton
                      icon="eye"
                      label="Open Litho activity"
                      onclick={() => (workspaceActivity = 'Activity opened')}
                    />
                  </Tooltip>
                  <Tooltip content="More actions">
                    <IconButton
                      icon="ellipsis_v"
                      label="More Litho actions"
                      onclick={() => (workspaceActivity = 'Litho menu opened')}
                    />
                  </Tooltip>
                </Toolbar>
              {/snippet}
            </ListItem>

            <ListItem
              value="aurora"
              label="Aurora research"
              description="feature/insights · review requested"
              metadata="18m"
              onclick={() => (workspaceActivity = 'Aurora opened')}
            >
              {#snippet leading()}
                <Icon name="branch" />
              {/snippet}
              {#snippet actions()}
                <Toolbar aria-label="Aurora workspace actions">
                  <Tooltip content="Open activity">
                    <IconButton
                      icon="eye"
                      label="Open Aurora activity"
                      onclick={() => (workspaceActivity = 'Activity opened')}
                    />
                  </Tooltip>
                  <Tooltip content="More actions">
                    <IconButton
                      icon="ellipsis_v"
                      label="More Aurora actions"
                      onclick={() => (workspaceActivity = 'Aurora menu opened')}
                    />
                  </Tooltip>
                </Toolbar>
              {/snippet}
            </ListItem>

            <ListItem
              value="atlas"
              label="Atlas migration"
              description="release/2.4 · pipeline running"
              metadata="1h"
              onclick={() => (workspaceActivity = 'Atlas opened')}
            >
              {#snippet leading()}
                <Icon name="status-running" />
              {/snippet}
              {#snippet actions()}
                <Toolbar aria-label="Atlas workspace actions">
                  <Tooltip content="Open pipeline">
                    <IconButton
                      icon="status"
                      label="Open Atlas pipeline"
                      onclick={() => (workspaceActivity = 'Pipeline opened')}
                    />
                  </Tooltip>
                  <Tooltip content="More actions">
                    <IconButton
                      icon="ellipsis_v"
                      label="More Atlas actions"
                      onclick={() => (workspaceActivity = 'Atlas menu opened')}
                    />
                  </Tooltip>
                </Toolbar>
              {/snippet}
            </ListItem>

            <ListItem
              value="legacy"
              label="Legacy imports"
              description="Archived workspace"
              metadata="Archived"
              disabled
            >
              {#snippet leading()}
                <Icon name="archive" />
              {/snippet}
            </ListItem>
          </List>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="checkbox-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">04 / Selection</p>
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

      <section class="lab-section" aria-labelledby="radio-switch-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">05 / Choice semantics</p>
            <h2 id="radio-switch-lab-title">Radio &amp; switch</h2>
          </div>
          <p>Exclusive choices and immediate binary settings stay native.</p>
        </div>

        <div class="selection-control-grid">
          <article>
            <span>Radio group / horizontal</span>
            <RadioGroup
              legend="Theme mode"
              orientation="horizontal"
              helperText="Follows the active workspace by default."
              bind:value={themeMode}
            >
              <Radio value="system">System</Radio>
              <Radio value="light">Light</Radio>
              <Radio value="dark">Dark</Radio>
              <Radio value="contrast" disabled>Contrast</Radio>
            </RadioGroup>
          </article>

          <article>
            <span>Radio group / error</span>
            <RadioGroup
              legend="Default visibility"
              error="Choose a visibility level."
              required
              bind:value={defaultVisibility}
            >
              <Radio value="private">Private</Radio>
              <Radio value="internal">Internal</Radio>
              <Radio value="public">Public</Radio>
            </RadioGroup>
          </article>

          <article>
            <span>Switch / interactive</span>
            <div class="switch-stack">
              <Switch bind:checked={compactRows}>Compact rows</Switch>
              <Switch bind:checked={liveSync}>Live synchronization</Switch>
            </div>
          </article>

          <article>
            <span>Switch / disabled</span>
            <div class="switch-stack">
              <Switch disabled>External notifications</Switch>
              <Switch checked disabled>Audit logging</Switch>
            </div>
          </article>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="text-field-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">06 / Input</p>
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

      <section class="lab-section" aria-labelledby="choice-field-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">07 / Input selection</p>
            <h2 id="choice-field-lab-title">Select &amp; combobox</h2>
          </div>
          <p>
            One connected reveal surface for direct choice and filtered
            keyboard search.
          </p>
        </div>

        <div class="choice-field-grid">
          <article>
            <span>Select / filled</span>
            <Select
              label="Access level"
              options={accessOptions}
              helperText="Owner is unavailable under the current policy."
              bind:value={accessLevel}
            />
          </article>

          <article>
            <span>Select / error</span>
            <Select
              label="Default access"
              options={accessOptions}
              placeholder="Choose a level"
              error="Choose a default access level."
              required
              bind:value={invalidAccessLevel}
            />
          </article>

          <article>
            <span>Select / disabled</span>
            <Select
              label="Workflow"
              options={accessOptions}
              value="developer"
              helperText="Managed by your organization."
              disabled
            />
          </article>

          <article>
            <span>Combobox / searchable</span>
            <Combobox
              label="Reviewer"
              options={peopleOptions}
              placeholder="Search by name, team or location"
              helperText="Arrow keys navigate; Enter selects."
              bind:value={reviewer}
            />
          </article>

          <article>
            <span>Combobox / error</span>
            <Combobox
              label="Required reviewer"
              options={peopleOptions}
              placeholder="Search people"
              error="Assign at least one reviewer."
              required
              bind:value={missingReviewer}
            />
          </article>

          <article>
            <span>Combobox / readonly</span>
            <Combobox
              label="Owner"
              options={peopleOptions}
              helperText="Inherited from the parent workspace."
              readonly
              bind:value={owner}
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
  .toolbar-lab span,
  .toolbar-lab small,
  .list-lab-header span,
  .list-lab-header small,
  .checkbox-grid article > span,
  .selection-control-grid article > span,
  .text-field-grid article > span,
  .choice-field-grid article > span {
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

  .checkbox-grid,
  .selection-control-grid {
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

  .toolbar-lab {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 1rem;
    padding: 1rem;
    border-radius: var(--radius-lds-sm);
    background:
      color-mix(
        in srgb,
        var(--md-sys-color-secondary) 5%,
        transparent
      );
  }

  .toolbar-lab > div {
    display: grid;
    gap: 0.2rem;
  }

  .toolbar-lab :global(.toolbar-undo .lds-icon) {
    transform: scaleX(-1);
  }

  .list-lab {
    display: grid;
    min-width: 0;
    gap: 0.5rem;
  }

  .list-lab-header {
    display: flex;
    min-width: 0;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding: 0.35rem 0.4rem 0.35rem 0.55rem;
    border-radius: var(--radius-lds-sm);
    background:
      color-mix(
        in srgb,
        var(--md-sys-color-secondary) 5%,
        transparent
      );
  }

  .list-lab-header > div {
    display: grid;
    min-width: 0;
    gap: 0.05rem;
  }

  .list-lab-header span,
  .list-lab-header small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .list-lab-header span {
    color: var(--md-sys-color-on-surface);
    font-weight: 500;
    line-height: 1.2;
  }

  .list-lab-header small {
    font-size: 0.68rem;
    line-height: 1.2;
  }

  .text-field-grid,
  .choice-field-grid {
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

  .selection-control-grid article {
    display: grid;
    min-width: 0;
    min-height: 10rem;
    gap: 1rem;
    padding: 1rem;
    border-radius: var(--radius-lds-sm);
    background:
      color-mix(
        in srgb,
        var(--md-sys-color-secondary) 5%,
        transparent
      );
  }

  .text-field-grid article,
  .choice-field-grid article {
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

  .checkbox-grid article > span,
  .selection-control-grid article > span {
    align-self: start;
  }

  .text-field-grid article > span,
  .choice-field-grid article > span {
    align-self: start;
  }

  .checkbox-grid article :global(.lds-checkbox) {
    align-self: end;
    justify-self: start;
  }

  .selection-control-grid article :global(.lds-radio-group),
  .selection-control-grid article .switch-stack {
    align-self: end;
  }

  .switch-stack {
    display: grid;
    gap: 0.15rem;
  }

  .button-group-grid article :global(.lds-button-group) {
    align-self: end;
  }

  .text-field-grid article :global(.lds-text-field),
  .choice-field-grid article :global(.lds-field) {
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

    .checkbox-grid,
    .selection-control-grid {
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

    .toolbar-lab {
      display: grid;
      align-items: start;
    }

    .list-lab-header {
      display: grid;
      align-items: start;
    }

    .text-field-grid,
    .choice-field-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
