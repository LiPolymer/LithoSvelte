<script lang="ts">
  import { onDestroy } from 'svelte'
  import {
    AlertDialog,
    Badge,
    ButtonGroup,
    Card,
    Checkbox,
    Combobox,
    DataTable,
    DataTableRow,
    DataTableSelectAll,
    Dialog,
    DialogClose,
    GhostButton,
    Icon,
    IconButton,
    List,
    ListItem,
    Menu,
    MenuCheckboxItem,
    MenuItem,
    MenuLabel,
    MenuRadioGroup,
    MenuRadioItem,
    MenuSeparator,
    NavigationTree,
    NavigationTreeItem,
    PrimaryButton,
    Radio,
    RadioGroup,
    Select,
    SplitPane,
    Switch,
    Tab,
    TabPanel,
    Tabs,
    TextField,
    ThemeSeedPicker,
    TonalButton,
    Toolbar,
    ToolbarSeparator,
    Tooltip,
    type DataTableValue,
    type ListboxOption,
    type ListboxValue,
    type ListValue,
    type MenuValue,
    type NavigationTreeValue,
    type RadioValue,
  } from './lib'

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
  let selectedWorkItems: DataTableValue[] = ['keyboard']
  let workItemActivity = 'Ready'
  let menuActivity = 'Ready'
  let showArchivedWorkspaces = false
  let compactMenuMetadata = true
  let workspaceSort: MenuValue = 'recent'
  let activeLabSection: NavigationTreeValue | undefined = 'button-lab-title'
  let navigationTreePreview: NavigationTreeValue | undefined = 'tree-overview'
  let navigationTab = 'overview'
  let summaryDialogOpen = false
  let editDialogOpen = false
  let dialogWorkspaceName = 'Litho Design System'
  let alertDialogOpen = false
  let wideDialogOpen = false
  let galleryDensity: string | number = 'comfortable'
  let resolvedGalleryDensity = 'default'
  let previousDocumentDensity: string | null | undefined
  let gallerySplit = 22
  let workspaceSplit = 34
  let inspectorSplit = 58

  function navigateLab(value: NavigationTreeValue) {
    activeLabSection = value
    const heading = document.getElementById(String(value))
    const section = heading?.closest('section')
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth'
    section?.scrollIntoView({ behavior, block: 'start' })
  }

  $: resolvedGalleryDensity =
    galleryDensity === 'compact' ? 'compact' : 'default'

  $: if (typeof document !== 'undefined') {
    const documentRoot = document.documentElement

    if (previousDocumentDensity === undefined) {
      previousDocumentDensity = documentRoot.getAttribute('data-lds-density')
    }

    documentRoot.setAttribute('data-lds-density', resolvedGalleryDensity)
  }

  onDestroy(() => {
    if (typeof document === 'undefined') return

    if (previousDocumentDensity === null) {
      document.documentElement.removeAttribute('data-lds-density')
    } else if (previousDocumentDensity !== undefined) {
      document.documentElement.setAttribute(
        'data-lds-density',
        previousDocumentDensity,
      )
    }
  })

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
  <title>Litho · Control Gallery</title>
</svelte:head>

<div
  class="lab-shell"
  data-gallery-density={galleryDensity}
  data-lds-density={resolvedGalleryDensity}
>
  <header class="lab-header">
    <div class="gallery-brand">
      <span class="gallery-brand__mark" aria-hidden="true">
        <Icon name="applications" size={18} />
      </span>
      <span class="gallery-brand__copy">
        <strong>Litho</strong>
        <small>Control Gallery</small>
      </span>
    </div>

    <div class="gallery-header-status" aria-label="Gallery status">
      <Badge icon="applications" tone="primary">14 groups</Badge>
      <Badge
        icon="scale"
        variant="outline"
        title="Regular / compact control height"
      >
        {galleryDensity === 'compact' ? '2 / 1.75rem' : '2.375 / 2rem'}
      </Badge>
    </div>

    <div class="gallery-header-tools">
      <Toolbar aria-label="Gallery quick jumps" class="gallery-quick-jumps">
        <Tooltip content="Jump to actions">
          <IconButton
            icon="applications"
            label="Jump to actions"
            onclick={() => navigateLab('button-lab-title')}
          />
        </Tooltip>
        <Tooltip content="Jump to inputs">
          <IconButton
            icon="pencil"
            label="Jump to inputs"
            onclick={() => navigateLab('checkbox-lab-title')}
          />
        </Tooltip>
        <Tooltip content="Jump to layout">
          <IconButton
            icon="sidebar"
            label="Jump to layout"
            onclick={() => navigateLab('split-pane-lab-title')}
          />
        </Tooltip>
      </Toolbar>

      <div class="gallery-density-control">
        <span>Density</span>
        <ButtonGroup
          mode="options"
          bind:value={galleryDensity}
          aria-label="Gallery density"
        >
          <Tooltip content="Compact gallery">
            <IconButton
              icon="list-bulleted"
              label="Compact gallery"
              value="compact"
            />
          </Tooltip>
          <Tooltip content="Comfortable gallery">
            <IconButton
              icon="dot-grid"
              label="Comfortable gallery"
              value="comfortable"
            />
          </Tooltip>
        </ButtonGroup>
      </div>
    </div>
  </header>

  <SplitPane
    bind:value={gallerySplit}
    label="Resize gallery catalog and canvas"
    min={18}
    max={34}
    step={1}
    resetValue={22}
    class="lab-layout"
  >
    {#snippet first()}
      <aside class="lab-sidebar" aria-label="Gallery catalog and theme controls">
        <div class="gallery-sidebar-heading">
          <div>
            <strong>Component catalog</strong>
            <small>Interactive specimen index</small>
          </div>
          <Badge icon="list-bulleted" variant="outline">14</Badge>
        </div>

      <NavigationTree
        label="Control Gallery sections"
        bind:value={activeLabSection}
        onvaluechange={navigateLab}
      >
        <NavigationTreeItem label="Actions" icon="applications" expanded>
          <NavigationTreeItem
            value="button-lab-title"
            label="Buttons"
            icon="play"
          />
          <NavigationTreeItem
            value="toolbar-lab-title"
            label="Toolbar"
            icon="settings"
          />
          <NavigationTreeItem
            value="menu-lab-title"
            label="Menu"
            icon="ellipsis_v"
          />
          <NavigationTreeItem
            value="dialog-lab-title"
            label="Dialog"
            icon="details-block"
          />
        </NavigationTreeItem>

        <NavigationTreeItem label="Collections" icon="list-bulleted" expanded>
          <NavigationTreeItem
            value="list-lab-title"
            label="Compact list"
            icon="list-bulleted"
          />
          <NavigationTreeItem
            value="data-table-lab-title"
            label="Data table"
            icon="table"
          />
          <NavigationTreeItem
            value="badge-lab-title"
            label="Badge"
            icon="status"
          />
          <NavigationTreeItem
            value="card-lab-title"
            label="Card"
            icon="applications"
          />
          <NavigationTreeItem
            value="split-pane-lab-title"
            label="Split pane"
            icon="sidebar"
          />
        </NavigationTreeItem>

        <NavigationTreeItem label="Inputs" icon="pencil" expanded>
          <NavigationTreeItem
            value="checkbox-lab-title"
            label="Checkbox"
            icon="check"
          />
          <NavigationTreeItem
            value="radio-switch-lab-title"
            label="Radio & switch"
            icon="status"
          />
          <NavigationTreeItem
            value="text-field-lab-title"
            label="Text field"
            icon="pencil"
          />
          <NavigationTreeItem
            value="choice-field-lab-title"
            label="Select & combobox"
            icon="chevron-down"
          />
        </NavigationTreeItem>

        <NavigationTreeItem label="Navigation" icon="link" expanded>
          <NavigationTreeItem
            value="navigation-lab-title"
            label="Tree & tabs"
            icon="project"
          />
        </NavigationTreeItem>
      </NavigationTree>

      <div
        id="gallery-theme-controls"
        class="theme-dock"
        aria-label="Theme controls"
      >
        <div class="theme-dock__heading">
          <div>
            <strong>Theme workbench</strong>
            <small>Runtime Material color probe</small>
          </div>
          <Badge icon="appearance" tone="secondary">Live</Badge>
        </div>
        <ThemeSeedPicker />
        <p>
          Change the seed or appearance mode to probe every component state.
        </p>
      </div>
      </aside>
    {/snippet}

    {#snippet second()}
    <main class="lab-content" aria-labelledby="gallery-title">
      <Card
        as="section"
        variant="filled"
        density="compact"
        class="gallery-overview"
      >
        <div class="gallery-overview__copy">
          <p class="lab-kicker">Interactive component inventory</p>
          <h1 id="gallery-title">Control Gallery</h1>
          <p class="lab-intro">
            A production-density workbench for inspecting Litho controls,
            compound behavior and theme states in one place.
          </p>
        </div>

        <div class="gallery-overview__metadata" aria-label="Gallery features">
          <Badge icon="keyboard" tone="primary">Keyboard first</Badge>
          <Badge icon="appearance" tone="secondary">Dynamic color</Badge>
          <Badge icon="status" tone="tertiary">Live state</Badge>
        </div>
      </Card>

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
          <Card as="article">
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
          </Card>

          <Card as="article">
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
          </Card>
        </div>

        <Card class="icon-button-lab">
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
        </Card>
      </section>

      <section class="lab-section" aria-labelledby="toolbar-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">02 / Composite actions</p>
            <h2 id="toolbar-lab-title">Toolbar</h2>
          </div>
          <p>One Tab stop, then arrow keys for efficient command navigation.</p>
        </div>

        <Card class="toolbar-lab">
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
        </Card>
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

      <section class="lab-section" aria-labelledby="data-table-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">04 / Structured data</p>
            <h2 id="data-table-lab-title">Data table</h2>
          </div>
          <p>Native table semantics with dense selection and row-level tools.</p>
        </div>

        <div class="data-table-lab">
          <header class="data-table-lab-header">
            <div>
              <span>Open work items</span>
              <small aria-live="polite">
                {selectedWorkItems.length} selected · {workItemActivity}
              </small>
            </div>

            <Toolbar aria-label="Work item table controls">
              <Tooltip content="Filter work items">
                <IconButton
                  icon="filter"
                  label="Filter work items"
                  onclick={() => (workItemActivity = 'Filter opened')}
                />
              </Tooltip>
              <Tooltip content="Choose columns">
                <IconButton
                  icon="applications"
                  label="Choose columns"
                  onclick={() => (workItemActivity = 'Columns opened')}
                />
              </Tooltip>

              <ToolbarSeparator />

              <Tooltip content="Export work items">
                <IconButton
                  icon="download"
                  label="Export work items"
                  variant="tonal"
                  onclick={() => (workItemActivity = 'Export requested')}
                />
              </Tooltip>
            </Toolbar>
          </header>

          <DataTable
            selectionMode="multiple"
            bind:selected={selectedWorkItems}
            aria-label="Open work items"
            onselectionchange={(selection) =>
              (workItemActivity = `${selection.length} rows selected`)}
          >
            <thead>
              <tr>
                <DataTableSelectAll />
                <th scope="col">Work item</th>
                <th scope="col">Status</th>
                <th scope="col">Assignee</th>
                <th scope="col" class="lds-data-table__cell--numeric">
                  Updated
                </th>
                <th scope="col">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody>
              <DataTableRow
                value="tokens"
                selectionLabel="Select token taxonomy audit"
              >
                <td>
                  <div class="lds-data-table__cell-stack">
                    <span class="lds-data-table__primary">
                      Token taxonomy audit
                    </span>
                    <span class="lds-data-table__secondary">
                      #42 · Design system
                    </span>
                  </div>
                </td>
                <td>
                  <Badge tone="tertiary" icon="review-list">In review</Badge>
                </td>
                <td>Mira Chen</td>
                <td class="lds-data-table__cell--numeric">4m</td>
                <td class="lds-data-table__actions-cell">
                  <Toolbar aria-label="Token taxonomy audit actions">
                    <Tooltip content="Edit work item">
                      <IconButton
                        icon="pencil"
                        label="Edit token taxonomy audit"
                        onclick={() => (workItemActivity = 'Editor opened')}
                      />
                    </Tooltip>
                    <Tooltip content="More actions">
                      <IconButton
                        icon="ellipsis_v"
                        label="More token taxonomy audit actions"
                        onclick={() => (workItemActivity = 'Row menu opened')}
                      />
                    </Tooltip>
                  </Toolbar>
                </td>
              </DataTableRow>

              <DataTableRow
                value="keyboard"
                selectionLabel="Select data table keyboard navigation"
              >
                <td>
                  <div class="lds-data-table__cell-stack">
                    <span class="lds-data-table__primary">
                      Data table keyboard navigation
                    </span>
                    <span class="lds-data-table__secondary">
                      #38 · Accessibility
                    </span>
                  </div>
                </td>
                <td>
                  <Badge tone="primary" icon="status-running">
                    In progress
                  </Badge>
                </td>
                <td>Sora Kim</td>
                <td class="lds-data-table__cell--numeric">18m</td>
                <td class="lds-data-table__actions-cell">
                  <Toolbar aria-label="Keyboard navigation actions">
                    <Tooltip content="Open work item">
                      <IconButton
                        icon="eye"
                        label="Open keyboard navigation work item"
                        onclick={() => (workItemActivity = 'Work item opened')}
                      />
                    </Tooltip>
                    <Tooltip content="More actions">
                      <IconButton
                        icon="ellipsis_v"
                        label="More keyboard navigation actions"
                        onclick={() => (workItemActivity = 'Row menu opened')}
                      />
                    </Tooltip>
                  </Toolbar>
                </td>
              </DataTableRow>

              <DataTableRow
                value="tooltip"
                selectionLabel="Select tooltip collision handling"
              >
                <td>
                  <div class="lds-data-table__cell-stack">
                    <span class="lds-data-table__primary">
                      Tooltip collision handling
                    </span>
                    <span class="lds-data-table__secondary">
                      #31 · Interaction
                    </span>
                  </div>
                </td>
                <td>
                  <Badge variant="outline" icon="check-circle">Ready</Badge>
                </td>
                <td>Sam Rivera</td>
                <td class="lds-data-table__cell--numeric">1h</td>
                <td class="lds-data-table__actions-cell">
                  <Toolbar aria-label="Tooltip collision actions">
                    <Tooltip content="Start work">
                      <IconButton
                        icon="play"
                        label="Start tooltip collision work"
                        onclick={() => (workItemActivity = 'Work started')}
                      />
                    </Tooltip>
                    <Tooltip content="More actions">
                      <IconButton
                        icon="ellipsis_v"
                        label="More tooltip collision actions"
                        onclick={() => (workItemActivity = 'Row menu opened')}
                      />
                    </Tooltip>
                  </Toolbar>
                </td>
              </DataTableRow>

              <DataTableRow
                value="legacy"
                selectionLabel="Select legacy importer cleanup"
                disabled
              >
                <td>
                  <div class="lds-data-table__cell-stack">
                    <span class="lds-data-table__primary">
                      Legacy importer cleanup
                    </span>
                    <span class="lds-data-table__secondary">
                      #12 · Archived
                    </span>
                  </div>
                </td>
                <td>
                  <Badge tone="error" icon="entity-blocked">Blocked</Badge>
                </td>
                <td>Niko Petrova</td>
                <td class="lds-data-table__cell--numeric">2d</td>
                <td class="lds-data-table__actions-cell"></td>
              </DataTableRow>
            </tbody>
          </DataTable>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="checkbox-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">05 / Selection</p>
            <h2 id="checkbox-lab-title">Checkbox</h2>
          </div>
          <p>Click or use the keyboard to inspect its real interaction states.</p>
        </div>

        <div class="checkbox-grid">
          <Card as="article">
            <span>Interactive / unchecked</span>
            <Checkbox bind:checked={expressiveMotion}>
              Expressive motion
            </Checkbox>
          </Card>

          <Card as="article">
            <span>Interactive / checked</span>
            <Checkbox bind:checked={notifications}>
              Notifications
            </Checkbox>
          </Card>

          <Card as="article">
            <span>Disabled / unchecked</span>
            <Checkbox disabled>
              Expressive motion
            </Checkbox>
          </Card>

          <Card as="article">
            <span>Disabled / checked</span>
            <Checkbox checked disabled>
              Notifications
            </Checkbox>
          </Card>

          <Card as="article">
            <span>Interactive / mixed</span>
            <Checkbox indeterminate>
              Partially selected
            </Checkbox>
          </Card>

          <Card as="article" class="forced-state">
            <span>Hover · focus · pressed</span>
            <div class="selection-state-probe">
              <Checkbox data-demo-state="hover">Hover</Checkbox>
              <Checkbox data-demo-state="focus" checked>Focus</Checkbox>
              <Checkbox data-demo-state="pressed">Pressed</Checkbox>
            </div>
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="radio-switch-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">06 / Choice semantics</p>
            <h2 id="radio-switch-lab-title">Radio &amp; switch</h2>
          </div>
          <p>Exclusive choices and immediate binary settings stay native.</p>
        </div>

        <div class="selection-control-grid">
          <Card as="article">
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
          </Card>

          <Card as="article">
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
          </Card>

          <Card as="article">
            <span>Switch / interactive</span>
            <div class="switch-stack">
              <Switch bind:checked={compactRows}>Compact rows</Switch>
              <Switch bind:checked={liveSync}>Live synchronization</Switch>
            </div>
          </Card>

          <Card as="article">
            <span>Switch / disabled</span>
            <div class="switch-stack">
              <Switch disabled>External notifications</Switch>
              <Switch checked disabled>Audit logging</Switch>
            </div>
          </Card>

          <Card as="article" class="forced-state">
            <span>Switch / hover · focus · pressed</span>
            <div class="selection-state-probe">
              <Switch data-demo-state="hover">Hover</Switch>
              <Switch data-demo-state="focus" checked>Focus</Switch>
              <Switch data-demo-state="pressed">Pressed</Switch>
            </div>
          </Card>

          <Card as="article" class="forced-state">
            <span>Radio / hover · focus · pressed</span>
            <RadioGroup legend="State sequence" orientation="horizontal">
              <Radio value="hover" data-demo-state="hover">Hover</Radio>
              <Radio value="focus" data-demo-state="focus">Focus</Radio>
              <Radio value="pressed" data-demo-state="pressed">Pressed</Radio>
            </RadioGroup>
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="text-field-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">07 / Input</p>
            <h2 id="text-field-lab-title">Text field</h2>
          </div>
          <p>Probe content hierarchy, focus, errors and non-editable states.</p>
        </div>

        <div class="text-field-grid">
          <Card as="article">
            <span>Default / empty</span>
            <TextField
              label="Display name"
              placeholder="Lithium Fish"
              helperText="Press Enter to commit and release focus."
              commitOnEnter
              bind:value={displayName}
            />
          </Card>

          <Card as="article">
            <span>Default / filled</span>
            <TextField
              label="Email"
              type="email"
              helperText="Used for account notifications."
              bind:value={email}
            />
          </Card>

          <Card as="article">
            <span>Error</span>
            <TextField
              label="Email"
              type="email"
              value="not-an-email"
              error="Enter a valid email address."
              required
            />
          </Card>

          <Card as="article">
            <span>Readonly</span>
            <TextField
              label="Theme source"
              value="Material seed color"
              helperText="Generated by the active theme."
              readonly
            />
          </Card>

          <Card as="article">
            <span>Disabled</span>
            <TextField
              label="Workspace"
              value="Unavailable"
              helperText="This field cannot be edited."
              disabled
            />
          </Card>

          <Card as="article" class="forced-state">
            <span>Hover</span>
            <TextField
              label="Repository path"
              value="litho/design-system"
              data-demo-state="hover"
            />
          </Card>

          <Card as="article" class="forced-state">
            <span>Focus</span>
            <TextField
              label="Branch"
              value="main"
              data-demo-state="focus"
            />
          </Card>

          <Card as="article">
            <span>Readonly / error</span>
            <TextField
              label="Generated slug"
              value="invalid slug"
              error="The generated value cannot be published."
              readonly
            />
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="menu-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">08 / Floating actions</p>
            <h2 id="menu-lab-title">Menu</h2>
          </div>
          <p>
            Compact command and option menus share one floating interaction
            model.
          </p>
        </div>

        <div class="menu-lab">
          <Card as="article" class="menu-card">
            <div class="menu-lab__copy">
              <span>Commands + persistent options</span>
              <small>{menuActivity}</small>
            </div>

            <Menu label="Workspace actions">
              {#snippet trigger()}
                <TonalButton class="menu-trigger">
                  Workspace
                  <Icon name="chevron-down" size={14} />
                </TonalButton>
              {/snippet}

              <MenuLabel>Workspace</MenuLabel>
              <MenuItem
                      label="Open workspace"
                      shortcut="↵"
                      onclick={() => (menuActivity = 'Workspace opened')}
              >
                {#snippet leading()}
                  <Icon name="project" size={14} />
                {/snippet}
              </MenuItem>
              <MenuItem
                      label="Rename"
                      shortcut="F2"
                      onclick={() => (menuActivity = 'Rename requested')}
              >
                {#snippet leading()}
                  <Icon name="pencil" size={14} />
                {/snippet}
              </MenuItem>
              <MenuItem label="Export" shortcut="Ctrl E" disabled>
                {#snippet leading()}
                  <Icon name="download" size={14} />
                {/snippet}
              </MenuItem>

              <MenuSeparator />
              <MenuCheckboxItem
                      label="Show archived"
                      bind:checked={showArchivedWorkspaces}
              />
              <MenuCheckboxItem
                      label="Compact metadata"
                      bind:checked={compactMenuMetadata}
              />

              <MenuSeparator />
              <MenuLabel>Sort by</MenuLabel>
              <MenuRadioGroup label="Sort workspaces" bind:value={workspaceSort}>
                <MenuRadioItem value="recent" label="Recent activity" />
                <MenuRadioItem value="name" label="Name" />
                <MenuRadioItem value="created" label="Created date" />
              </MenuRadioGroup>

              <MenuSeparator />
              <MenuItem
                      label="Archive workspace"
                      variant="danger"
                      onclick={() => (menuActivity = 'Archive requested')}
              >
                {#snippet leading()}
                  <Icon name="archive" size={14} />
                {/snippet}
              </MenuItem>
            </Menu>
          </Card>

          <Card as="article" class="menu-card">
            <div class="menu-lab__copy">
              <span>End-aligned contextual menu</span>
              <small>Arrow keys, Home/End and typeahead are active.</small>
            </div>

            <Menu label="Context actions" align="end">
              {#snippet trigger()}
                <IconButton icon="ellipsis_v" label="Open context menu" />
              {/snippet}

              <MenuItem
                      label="Edit"
                      shortcut="E"
                      onclick={() => (menuActivity = 'Edit requested')}
              >
                {#snippet leading()}
                  <Icon name="pencil" size={14} />
                {/snippet}
              </MenuItem>
              <MenuItem
                      label="Download"
                      shortcut="D"
                      onclick={() => (menuActivity = 'Download requested')}
              >
                {#snippet leading()}
                  <Icon name="download" size={14} />
                {/snippet}
              </MenuItem>
              <MenuSeparator />
              <MenuItem label="Remove" variant="danger">
                {#snippet leading()}
                  <Icon name="remove" size={14} />
                {/snippet}
              </MenuItem>
            </Menu>
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="choice-field-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">09 / Input selection</p>
            <h2 id="choice-field-lab-title">Select &amp; combobox</h2>
          </div>
          <p>
            One connected reveal surface for direct choice and filtered
            keyboard search.
          </p>
        </div>

        <div class="choice-field-grid">
          <Card as="article">
            <span>Select / filled</span>
            <Select
              label="Access level"
              options={accessOptions}
              helperText="Owner is unavailable under the current policy."
              bind:value={accessLevel}
            />
          </Card>

          <Card as="article">
            <span>Select / error</span>
            <Select
              label="Default access"
              options={accessOptions}
              placeholder="Choose a level"
              error="Choose a default access level."
              required
              bind:value={invalidAccessLevel}
            />
          </Card>

          <Card as="article">
            <span>Select / disabled</span>
            <Select
              label="Workflow"
              options={accessOptions}
              value="developer"
              helperText="Managed by your organization."
              disabled
            />
          </Card>

          <Card as="article">
            <span>Combobox / searchable</span>
            <Combobox
              label="Reviewer"
              options={peopleOptions}
              placeholder="Search by name, team or location"
              helperText="Arrow keys navigate; Enter selects."
              bind:value={reviewer}
            />
          </Card>

          <Card as="article">
            <span>Combobox / error</span>
            <Combobox
              label="Required reviewer"
              options={peopleOptions}
              placeholder="Search people"
              error="Assign at least one reviewer."
              required
              bind:value={missingReviewer}
            />
          </Card>

          <Card as="article">
            <span>Combobox / readonly</span>
            <Combobox
              label="Owner"
              options={peopleOptions}
              helperText="Inherited from the parent workspace."
              readonly
              bind:value={owner}
            />
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="badge-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">10 / Metadata</p>
            <h2 id="badge-lab-title">Badge</h2>
          </div>
          <p>
            Compact, non-interactive metadata with seed-aware semantic tones.
          </p>
        </div>

        <div class="badge-lab">
          <Card as="article">
            <span>Soft / semantic icon</span>
            <div class="badge-row">
              <Badge icon="status-neutral">Neutral</Badge>
              <Badge tone="primary" icon="status-running">Primary</Badge>
              <Badge tone="secondary" icon="status-scheduled">
                Secondary
              </Badge>
              <Badge tone="tertiary" icon="review-list">Tertiary</Badge>
              <Badge tone="error" icon="status-failed">Error</Badge>
            </div>
          </Card>

          <Card as="article">
            <span>Outline / semantic icon</span>
            <div class="badge-row">
              <Badge variant="outline" icon="status-neutral">Neutral</Badge>
              <Badge tone="primary" variant="outline" icon="progress">
                Primary
              </Badge>
              <Badge tone="secondary" variant="outline" icon="clock">
                Secondary
              </Badge>
              <Badge tone="tertiary" variant="outline" icon="review-checkmark">
                Tertiary
              </Badge>
              <Badge tone="error" variant="outline" icon="error">Error</Badge>
            </div>
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="navigation-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">11 / Navigation</p>
            <h2 id="navigation-lab-title">Tree & tabs</h2>
          </div>
          <p>
            Hierarchical destinations and peer views with distinct keyboard
            models.
          </p>
        </div>

        <div class="navigation-lab">
          <Card as="article">
            <span>Navigation tree / nested destinations</span>
            <NavigationTree
              label="Workspace navigation preview"
              bind:value={navigationTreePreview}
            >
              <NavigationTreeItem label="Workspace" icon="project" expanded>
                <NavigationTreeItem
                  value="tree-overview"
                  label="Overview"
                  icon="applications"
                />
                <NavigationTreeItem
                  value="tree-activity"
                  label="Activity"
                  icon="status-running"
                />
              </NavigationTreeItem>

              <NavigationTreeItem label="Manage" icon="settings" expanded>
                <NavigationTreeItem
                  value="tree-members"
                  label="Members"
                  icon="users"
                />
                <NavigationTreeItem
                  value="tree-integrations"
                  label="Integrations"
                  icon="link"
                  disabled
                />
              </NavigationTreeItem>
            </NavigationTree>
          </Card>

          <Card as="article">
            <span>Tabs / automatic activation</span>
            <Tabs label="Workspace views" bind:value={navigationTab}>
              {#snippet tabs()}
                <Tab value="overview" icon="project">Overview</Tab>
                <Tab value="activity" icon="status-running">Activity</Tab>
                <Tab value="notes" icon="comment">Notes</Tab>
              {/snippet}

              <TabPanel value="overview">
                <div class="navigation-panel-copy">
                  <strong>Overview</strong>
                  <span>Stable project context without leaving the page.</span>
                </div>
              </TabPanel>

              <TabPanel value="activity">
                <div class="navigation-panel-copy">
                  <strong>Activity</strong>
                  <span>Recent changes, optimized for quick scanning.</span>
                </div>
              </TabPanel>

              <TabPanel value="notes">
                <div class="navigation-panel-copy">
                  <strong>Notes</strong>
                  <span>Supporting information for the current workspace.</span>
                </div>
              </TabPanel>
            </Tabs>
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="card-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">12 / Containers</p>
            <h2 id="card-lab-title">Card</h2>
          </div>
          <p>
            Non-interactive grouping surfaces with explicit hierarchy and
            density.
          </p>
        </div>

        <div class="card-lab">
          <Card as="article">
            <span>Subtle / default density</span>
            <div class="card-demo-copy">
              <h3>Quiet grouping</h3>
              <p>Blends into its parent while preserving content rhythm.</p>
            </div>
          </Card>

          <Card as="article" variant="filled" density="compact">
            <span>Filled / compact density</span>
            <div class="card-demo-copy">
              <h3>Dense summary</h3>
              <p>Uses a firmer surface when nearby groups need separation.</p>
            </div>
          </Card>

          <Card as="article" variant="outlined">
            <span>Outlined / default density</span>
            <div class="card-demo-copy">
              <h3>Explicit boundary</h3>
              <p>Keeps the fill quiet and lets the container edge speak.</p>
            </div>
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="dialog-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">13 / Overlays</p>
            <h2 id="dialog-lab-title">Dialog</h2>
          </div>
          <p>
            Modal work surfaces with contained focus, explicit hierarchy and
            reversible presence motion.
          </p>
        </div>

        <div class="dialog-lab">
          <Card as="article" class="dialog-card">
            <span>Compact / surface focus</span>
            <div class="dialog-demo-copy">
              <h3>Review summary</h3>
              <p>A short, low-interruption confirmation surface.</p>
            </div>

            <Dialog
              bind:open={summaryDialogOpen}
              size="compact"
              initialFocus="surface"
            >
              {#snippet trigger()}
                <TonalButton>Open summary</TonalButton>
              {/snippet}

              {#snippet title()}Ready to publish{/snippet}

              {#snippet description()}
                Check the final state before sharing this workspace.
              {/snippet}

              <div class="dialog-preview">
                <Icon name="status_success" size={16} />
                <div>
                  <strong>All checks passed</strong>
                  <span>8 components and 24 tokens will be published.</span>
                </div>
              </div>

              {#snippet actions()}
                <DialogClose>
                  <GhostButton>Not now</GhostButton>
                </DialogClose>
                <DialogClose>
                  <PrimaryButton expressive={false}>Publish</PrimaryButton>
                </DialogClose>
              {/snippet}
            </Dialog>
          </Card>

          <Card as="article" class="dialog-card">
            <span>Default / explicit initial focus</span>
            <div class="dialog-demo-copy">
              <h3>Edit workspace</h3>
              <p>A compact form keeps the task in its current context.</p>
            </div>

            <Dialog bind:open={editDialogOpen}>
              {#snippet trigger()}
                <TonalButton>Edit details</TonalButton>
              {/snippet}

              {#snippet title()}Workspace details{/snippet}

              {#snippet description()}
                Update the label used across navigation and recent activity.
              {/snippet}

              <TextField
                label="Workspace name"
                bind:value={dialogWorkspaceName}
                data-lds-dialog-initial-focus=""
                commitOnEnter
              />

              {#snippet actions()}
                <DialogClose>
                  <GhostButton>Cancel</GhostButton>
                </DialogClose>
                <DialogClose>
                  <PrimaryButton expressive={false}>Save changes</PrimaryButton>
                </DialogClose>
              {/snippet}
            </Dialog>
          </Card>

          <Card as="article" class="dialog-card">
            <span>Alert / least-destructive focus</span>
            <div class="dialog-demo-copy">
              <h3>Discard changes</h3>
              <p>Requires an explicit decision and ignores backdrop clicks.</p>
            </div>

            <AlertDialog bind:open={alertDialogOpen} size="compact">
              {#snippet trigger()}
                <TonalButton>Open alert</TonalButton>
              {/snippet}

              {#snippet title()}Discard unsaved changes?{/snippet}

              {#snippet description()}
                The current workspace name will return to its saved value.
              {/snippet}

              <div class="dialog-alert-copy">
                <Icon name="warning" size={16} />
                <p>This action cannot be undone after leaving the editor.</p>
              </div>

              {#snippet actions()}
                <DialogClose>
                  <GhostButton data-lds-dialog-initial-focus="">
                    Keep editing
                  </GhostButton>
                </DialogClose>
                <DialogClose>
                  <PrimaryButton expressive={false}>
                    Discard changes
                  </PrimaryButton>
                </DialogClose>
              {/snippet}
            </AlertDialog>
          </Card>

          <Card as="article" class="dialog-card">
            <span>Wide / overflow + nested overlay</span>
            <div class="dialog-demo-copy">
              <h3>Review workspace</h3>
              <p>Exercises body scrolling and a Menu above the modal layer.</p>
            </div>

            <Dialog
              bind:open={wideDialogOpen}
              size="wide"
              style="--lds-dialog-max-height: min(26rem, calc(100dvh - 2rem))"
            >
              {#snippet trigger()}
                <TonalButton>Open wide dialog</TonalButton>
              {/snippet}

              {#snippet title()}Workspace review{/snippet}

              {#snippet description()}
                Verify scrolling, focus containment and nested overlay order.
              {/snippet}

              <div class="dialog-validation-list">
                <div class="dialog-validation-row">
                  <strong>Display options</strong>
                  <span>The nested Menu should retain focus above Dialog.</span>
                  <Menu label="Dialog display options">
                    {#snippet trigger()}
                      <TonalButton>Open nested menu</TonalButton>
                    {/snippet}
                    <MenuItem label="Compact metadata">
                      {#snippet leading()}
                        <Icon name="list-bulleted" size={14} />
                      {/snippet}
                    </MenuItem>
                    <MenuItem label="Show activity">
                      {#snippet leading()}
                        <Icon name="history" size={14} />
                      {/snippet}
                    </MenuItem>
                  </Menu>
                </div>
                <div class="dialog-validation-row">
                  <strong>Keyboard containment</strong>
                  <span>Tab and Shift+Tab remain inside the active dialog.</span>
                </div>
                <div class="dialog-validation-row">
                  <strong>Overflow ownership</strong>
                  <span>Only this body scrolls after reveal has settled.</span>
                </div>
                <div class="dialog-validation-row">
                  <strong>Escape order</strong>
                  <span>Escape closes the nested Menu before the Dialog.</span>
                </div>
                <div class="dialog-validation-row">
                  <strong>Focus restoration</strong>
                  <span>Closing returns focus to the wide-dialog trigger.</span>
                </div>
              </div>

              {#snippet actions()}
                <DialogClose>
                  <PrimaryButton expressive={false}>Done</PrimaryButton>
                </DialogClose>
              {/snippet}
            </Dialog>
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="split-pane-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">14 / Layout</p>
            <h2 id="split-pane-lab-title">Split pane</h2>
          </div>
          <p>
            Resizable work regions with pointer capture, keyboard control and
            explicit bounds.
          </p>
        </div>

        <div class="split-pane-lab">
          <Card as="article" density="compact" class="split-pane-card">
            <div class="split-pane-demo-heading">
              <span>Horizontal / {Math.round(workspaceSplit)}%</span>
              <small>Arrow keys · Shift ×5 · Home/End · double-click</small>
            </div>

            <SplitPane
              bind:value={workspaceSplit}
              label="Resize navigation and workspace"
              min={22}
              max={68}
              resetValue={34}
              class="split-pane-demo"
            >
              {#snippet first()}
                <div class="split-demo-panel split-demo-navigation">
                  <strong>Workspace</strong>
                  <span class="split-demo-row split-demo-row--selected">
                    Overview
                  </span>
                  <span class="split-demo-row">Activity</span>
                  <span class="split-demo-row">Components</span>
                  <span class="split-demo-row">Settings</span>
                </div>
              {/snippet}

              {#snippet second()}
                <div class="split-demo-panel split-demo-workspace">
                  <div>
                    <small>Active document</small>
                    <strong>Design system notes</strong>
                  </div>
                  <p>
                    Drag the divider, focus it and use Left/Right, or
                    double-click to restore the default proportion.
                  </p>
                </div>
              {/snippet}
            </SplitPane>
          </Card>

          <Card as="article" density="compact" class="split-pane-card">
            <div class="split-pane-demo-heading">
              <span>Vertical / {Math.round(inspectorSplit)}%</span>
              <small>Up/Down follows the visual split axis</small>
            </div>

            <SplitPane
              bind:value={inspectorSplit}
              label="Resize editor and inspector"
              direction="vertical"
              min={30}
              max={76}
              resetValue={58}
              class="split-pane-demo split-pane-demo--vertical"
            >
              {#snippet first()}
                <div class="split-demo-panel split-demo-editor">
                  <small>tokens.css</small>
                  <code>--lds-control-min-height: 2.375rem;</code>
                  <code>--lds-shape-rest: var(--radius-lds-sm);</code>
                </div>
              {/snippet}

              {#snippet second()}
                <div class="split-demo-panel split-demo-inspector">
                  <strong>Inspector</strong>
                  <span>Role: separator</span>
                  <span>Value: {Math.round(inspectorSplit)}%</span>
                </div>
              {/snippet}
            </SplitPane>
          </Card>
        </div>
      </section>
    </main>
    {/snippet}
  </SplitPane>
</div>

<style>
  .lab-shell {
    box-sizing: border-box;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    width: 100%;
    height: 100dvh;
    gap: 0.5rem;
    padding: 0.55rem;
    overflow: hidden;
    color: var(--md-sys-color-on-surface);
  }

  .lab-header {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    min-width: 0;
    align-items: center;
    gap: 0.75rem;
    padding: 0.35rem 0.45rem;
    border: 0.1rem solid var(--color-lds-toolbar-border);
    border-radius: var(--lds-shape-rest);
    background: var(--color-lds-toolbar-surface);
  }

  .gallery-brand,
  .gallery-header-status,
  .gallery-header-tools,
  .gallery-density-control {
    display: flex;
    min-width: 0;
    align-items: center;
  }

  .gallery-brand {
    gap: 0.55rem;
  }

  .gallery-brand__mark {
    display: grid;
    width: 2rem;
    height: 2rem;
    flex: 0 0 auto;
    place-items: center;
    border-radius: var(--lds-shape-hover-soft);
    color: var(--color-lds-primary-content);
    background: var(--color-lds-primary);
    box-shadow: 0 0 0 0.2rem var(--color-lds-primary-border-light);
  }

  .gallery-brand__copy {
    display: grid;
    line-height: 1.1;
  }

  .gallery-brand__copy strong {
    font-family: var(--heading);
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .gallery-brand__copy small,
  .gallery-sidebar-heading small,
  .theme-dock__heading small {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.65rem;
  }

  .gallery-header-status {
    justify-self: center;
    gap: 0.35rem;
  }

  .gallery-header-tools {
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .gallery-density-control {
    gap: 0.35rem;
  }

  .gallery-density-control > span {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.68rem;
  }

  :global(.gallery-quick-jumps) {
    flex: 0 0 auto;
  }

  :global(.gallery-overview) {
    display: flex;
    min-width: 0;
    align-items: end;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .gallery-overview__copy {
    display: grid;
    min-width: 0;
    gap: 0.35rem;
  }

  .gallery-overview__copy h1 {
    margin: 0;
    font-family: var(--heading);
    font-size: clamp(1.8rem, 4vw, 3.2rem);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.045em;
  }

  .gallery-overview__metadata {
    display: flex;
    flex: 0 0 auto;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.35rem;
  }

  .lab-kicker,
  .section-index,
  .section-heading > p,
  .theme-dock > p,
  .button-group-grid :global(.lds-card > span),
  .button-group-grid :global(.lds-card > small),
  :global(.icon-button-lab) span,
  :global(.icon-button-lab) small,
  :global(.toolbar-lab) span,
  :global(.toolbar-lab) small,
  .list-lab-header span,
  .list-lab-header small,
  .data-table-lab-header span,
  .data-table-lab-header small,
  .checkbox-grid :global(.lds-card > span),
  .selection-control-grid :global(.lds-card > span),
  .text-field-grid :global(.lds-card > span),
  .choice-field-grid :global(.lds-card > span),
  .badge-lab :global(.lds-card > span),
  .navigation-lab :global(.lds-card > span),
  .card-lab :global(.lds-card > span),
  .dialog-lab :global(.lds-card > span) {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.75rem;
  }

  .menu-lab {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .menu-lab :global(.menu-card) {
    display: flex;
    min-width: 0;
    min-height: 7rem;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
  }

  .menu-lab__copy {
    display: grid;
    min-width: 0;
    gap: 0.2rem;
  }

  .menu-lab__copy span,
  .menu-lab__copy small {
    overflow: hidden;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.75rem;
    text-overflow: ellipsis;
  }

  .menu-lab__copy small {
    font-size: 0.68rem;
    white-space: nowrap;
  }

  .badge-lab {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .badge-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
  }

  .navigation-lab {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .navigation-lab :global(.lds-card) {
    align-content: start;
  }

  .navigation-panel-copy {
    display: grid;
    gap: 0.2rem;
    min-height: 3rem;
    align-content: center;
  }

  .navigation-panel-copy strong {
    font-size: 0.78rem;
    font-weight: 500;
  }

  .navigation-panel-copy span {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.72rem;
  }

  .card-lab {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .card-demo-copy {
    display: grid;
    align-content: start;
    gap: 0.25rem;
  }

  .card-demo-copy h3,
  .card-demo-copy p {
    margin: 0;
  }

  .card-demo-copy h3 {
    font-family: var(--heading);
    font-size: 1rem;
    font-weight: 500;
  }

  .card-demo-copy p {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.75rem;
  }

  .dialog-lab {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .dialog-lab :global(.dialog-card) {
    min-height: 10rem;
    align-content: start;
  }

  .dialog-lab :global(.lds-dialog-anchor > .lds-btn) {
    align-self: end;
    justify-self: start;
  }

  .dialog-demo-copy {
    display: grid;
    gap: 0.25rem;
  }

  .dialog-demo-copy h3,
  .dialog-demo-copy p {
    margin: 0;
  }

  .dialog-demo-copy h3 {
    font-family: var(--heading);
    font-size: 1rem;
    font-weight: 500;
  }

  .dialog-demo-copy p,
  .dialog-preview span {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.75rem;
  }

  .dialog-preview {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
    gap: 0.55rem;
    padding: 0.65rem;
    border-radius: var(--lds-shape-rest);
    color: var(--color-lds-primary-content);
    background: var(--color-lds-option-selected);
  }

  .dialog-preview > div {
    display: grid;
    gap: 0.15rem;
  }

  .dialog-preview strong {
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .dialog-alert-copy {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
    gap: 0.55rem;
    padding: 0.65rem;
    border-radius: var(--lds-shape-rest);
    color: var(--md-sys-color-error);
    background: var(--color-lds-field-error);
  }

  .dialog-alert-copy p {
    margin: 0;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.75rem;
  }

  .dialog-validation-list {
    display: grid;
    gap: 0.35rem;
  }

  .dialog-validation-row {
    display: grid;
    min-height: 4rem;
    align-content: center;
    justify-items: start;
    gap: 0.15rem;
    padding: 0.65rem;
    border-radius: var(--lds-shape-rest);
    background: var(--color-lds-group-surface);
  }

  .dialog-validation-row strong {
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .dialog-validation-row span {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.72rem;
  }

  .dialog-validation-row :global(.lds-menu-anchor > .lds-btn) {
    margin-block-start: 0.35rem;
  }

  .split-pane-lab {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .split-pane-lab :global(.split-pane-card) {
    min-width: 0;
  }

  .split-pane-demo-heading {
    display: flex;
    min-width: 0;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .split-pane-demo-heading span,
  .split-pane-demo-heading small {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.72rem;
  }

  .split-pane-demo-heading small {
    overflow: hidden;
    font-size: 0.65rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(.split-pane-demo) {
    min-height: 17rem;
  }

  :global(.split-pane-demo--vertical) {
    height: 17rem;
  }

  .split-demo-panel {
    box-sizing: border-box;
    min-width: 0;
    min-height: 100%;
    padding: 0.7rem;
  }

  .split-demo-panel strong {
    font-size: 0.78rem;
    font-weight: 500;
  }

  .split-demo-panel small,
  .split-demo-panel span,
  .split-demo-panel p {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.7rem;
  }

  .split-demo-navigation,
  .split-demo-inspector,
  .split-demo-editor {
    display: grid;
    align-content: start;
    gap: 0.25rem;
  }

  .split-demo-row {
    padding: 0.35rem 0.45rem;
    border-radius: var(--lds-shape-rest);
  }

  .split-demo-panel .split-demo-row--selected {
    color: var(--color-lds-primary-content);
    background: var(--color-lds-option-selected);
  }

  .split-demo-workspace {
    display: grid;
    align-content: center;
    gap: 0.6rem;
  }

  .split-demo-workspace > div {
    display: grid;
    gap: 0.1rem;
  }

  .split-demo-workspace p {
    max-width: 26rem;
    margin: 0;
    line-height: 1.5;
  }

  .split-demo-editor code {
    overflow: hidden;
    padding: 0.35rem 0.45rem;
    border-radius: var(--lds-shape-rest);
    color: var(--md-sys-color-on-surface);
    background: var(--color-lds-group-surface);
    font-size: 0.68rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .lab-kicker,
  .section-index {
    margin: 0;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h2,
  p {
    margin: 0;
  }

  .lab-intro {
    max-width: 34rem;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.78rem;
  }

  :global(.lab-layout) {
    height: 100%;
    min-height: 0;
    border-radius: var(--lds-shape-rest);
  }

  :global(.lab-layout > .lds-split-pane__panel) {
    scrollbar-gutter: stable;
  }

  .lab-sidebar {
    box-sizing: border-box;
    display: grid;
    min-height: 100%;
    align-content: start;
    gap: 0.75rem;
    padding: 0.65rem;
    background:
      color-mix(
        in srgb,
        var(--md-sys-color-secondary) 2.5%,
        var(--md-sys-color-surface)
      );
  }

  .gallery-sidebar-heading,
  .theme-dock__heading {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .gallery-sidebar-heading > div,
  .theme-dock__heading > div {
    display: grid;
    min-width: 0;
    gap: 0.05rem;
  }

  .gallery-sidebar-heading strong,
  .theme-dock__heading strong {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .lab-content {
    box-sizing: border-box;
    display: grid;
    min-width: 0;
    min-height: 100%;
    align-content: start;
    gap: 0.65rem;
    padding: clamp(0.75rem, 1.8vw, 1.4rem);
    background: var(--md-sys-color-surface);
  }

  .lab-section {
    min-width: 0;
    scroll-margin-block-start: 0.65rem;
    padding: clamp(0.9rem, 1.7vw, 1.25rem);
    border: 0.1rem solid var(--color-lds-toolbar-border);
    border-radius: var(--radius-lds-md);
    background:
      color-mix(
        in srgb,
        var(--md-sys-color-secondary) 2%,
        var(--md-sys-color-surface)
      );
    transition: padding var(--lds-motion-duration-fast)
      var(--lds-motion-easing-state);
  }

  .section-heading {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 1.5rem;
    margin-bottom: 1.15rem;
  }

  .section-heading h2 {
    margin-top: 0.15em;
    font-family: var(--heading);
    font-size: clamp(1.35rem, 2.5vw, 1.9rem);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.025em;
  }

  .section-heading > p {
    max-width: 22rem;
    text-align: right;
  }

  .lab-shell[data-gallery-density='compact'] .lab-content {
    gap: 0.45rem;
    padding: 0.65rem;
  }

  .lab-shell[data-gallery-density='compact'] .lab-section {
    padding: 0.75rem;
  }

  .lab-shell[data-gallery-density='compact'] .section-heading {
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .lab-shell[data-gallery-density='compact'] .lab-header {
    gap: 0.5rem;
    padding: 0.35rem;
  }

  .lab-shell[data-gallery-density='compact'] .gallery-brand {
    gap: 0.4rem;
  }

  .lab-shell[data-gallery-density='compact'] .gallery-brand__mark {
    width: 1.75rem;
    height: 1.75rem;
  }

  .lab-shell[data-gallery-density='compact']
    .gallery-brand__mark
    :global(.lds-icon) {
    width: 0.875rem;
    height: 0.875rem;
  }

  .lab-shell[data-gallery-density='compact'] .gallery-header-tools {
    gap: 0.35rem;
  }

  .lab-shell[data-gallery-density='compact'] .lab-sidebar {
    gap: 0.55rem;
    padding: 0.5rem;
  }

  .lab-shell[data-gallery-density='compact'] .theme-dock {
    gap: 0.4rem;
    padding-top: 0.55rem;
  }

  .lab-shell[data-gallery-density='compact']
    :is(
      .button-group-grid,
      .checkbox-grid,
      .selection-control-grid,
      .text-field-grid,
      .choice-field-grid,
      .menu-lab,
      .badge-lab,
      .navigation-lab,
      .card-lab,
      .dialog-lab,
      .split-pane-lab,
      .list-lab,
      .data-table-lab
    ) {
    gap: 0.35rem;
  }

  .lab-shell[data-gallery-density='compact'] .button-group-grid {
    margin-top: 0.65rem;
  }

  .lab-shell[data-gallery-density='compact'] .state-table th,
  .lab-shell[data-gallery-density='compact'] .state-table td {
    padding: 0.55rem;
  }

  .lab-shell[data-gallery-density='compact'] :global(.icon-button-lab),
  .lab-shell[data-gallery-density='compact'] :global(.toolbar-lab) {
    gap: 0.65rem;
  }

  .lab-shell[data-gallery-density='compact']
    :global(.icon-button-lab) {
    margin-top: 0.35rem;
  }

  .lab-shell[data-gallery-density='compact']
    .menu-lab
    :global(.menu-card) {
    min-height: 5.75rem;
  }

  .lab-shell[data-gallery-density='compact']
    .checkbox-grid
    :global(.lds-card) {
    min-height: 5.5rem;
  }

  .lab-shell[data-gallery-density='compact']
    .selection-control-grid
    :global(.lds-card) {
    min-height: 8rem;
  }

  .lab-shell[data-gallery-density='compact']
    :is(.text-field-grid, .choice-field-grid)
    :global(.lds-card) {
    min-height: 7.5rem;
  }

  .lab-shell[data-gallery-density='compact']
    .dialog-lab
    :global(.dialog-card) {
    min-height: 8rem;
  }

  .lab-shell[data-gallery-density='compact']
    :global(.split-pane-demo) {
    min-height: 14rem;
  }

  .lab-shell[data-gallery-density='compact']
    :global(.split-pane-demo--vertical) {
    height: 14rem;
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

  :global(.icon-button-lab) {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  :global(.icon-button-lab) > div:first-child {
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

  :global(.toolbar-lab) {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 1rem;
  }

  :global(.toolbar-lab) > div {
    display: grid;
    gap: 0.2rem;
  }

  :global(.toolbar-lab .toolbar-undo .lds-icon) {
    transform: scaleX(-1);
  }

  .list-lab,
  .data-table-lab {
    display: grid;
    min-width: 0;
    gap: 0.5rem;
  }

  .list-lab-header,
  .data-table-lab-header {
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

  .list-lab-header > div,
  .data-table-lab-header > div {
    display: grid;
    min-width: 0;
    gap: 0.05rem;
  }

  .list-lab-header span,
  .list-lab-header small,
  .data-table-lab-header span,
  .data-table-lab-header small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .list-lab-header span,
  .data-table-lab-header span {
    color: var(--md-sys-color-on-surface);
    font-weight: 500;
    line-height: 1.2;
  }

  .list-lab-header small,
  .data-table-lab-header small {
    font-size: 0.68rem;
    line-height: 1.2;
  }

  .text-field-grid,
  .choice-field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .button-group-grid :global(.lds-card) {
    gap: 0.75rem;
  }

  .checkbox-grid :global(.lds-card) {
    min-height: 7rem;
  }

  .selection-control-grid :global(.lds-card) {
    min-height: 10rem;
  }

  .text-field-grid :global(.lds-card),
  .choice-field-grid :global(.lds-card) {
    min-height: 9rem;
  }

  .checkbox-grid :global(.lds-card > span),
  .selection-control-grid :global(.lds-card > span) {
    align-self: start;
  }

  .text-field-grid :global(.lds-card > span),
  .choice-field-grid :global(.lds-card > span) {
    align-self: start;
  }

  .checkbox-grid :global(.lds-card .lds-checkbox) {
    align-self: end;
    justify-self: start;
  }

  .selection-control-grid :global(.lds-card .lds-radio-group),
  .selection-control-grid :global(.lds-card .switch-stack) {
    align-self: end;
  }

  .switch-stack {
    display: grid;
    gap: 0.15rem;
  }

  .selection-state-probe {
    display: flex;
    align-self: end;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.1rem 0.7rem;
  }

  .button-group-grid :global(.lds-card .lds-button-group) {
    align-self: end;
  }

  .text-field-grid :global(.lds-card .lds-text-field),
  .choice-field-grid :global(.lds-card .lds-field) {
    align-self: end;
  }

  .theme-dock {
    display: grid;
    gap: 0.55rem;
    width: auto;
    padding-top: 0.75rem;
    border-top: 0.1rem solid var(--color-lds-group-divider);
  }

  .theme-dock :global(.theme-seed-picker) {
    width: 100%;
  }

  .theme-dock > p {
    max-width: 18rem;
    padding-inline: 0.25rem;
    font-size: 0.68rem;
    line-height: 1.4;
  }

  @media (max-width: 62rem) {
    .lab-shell {
      height: auto;
      min-height: 100dvh;
      overflow: visible;
    }

    :global(.lab-layout.lds-split-pane--horizontal) {
      display: grid;
      height: auto;
      min-height: 0;
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto auto;
      overflow: visible;
      border: 0;
      background: transparent;
    }

    :global(.lab-layout > .lds-split-pane__first) {
      grid-column: 1;
      grid-row: 1;
    }

    :global(.lab-layout > .lds-split-pane__separator) {
      display: none;
    }

    :global(.lab-layout > .lds-split-pane__second) {
      grid-column: 1;
      grid-row: 2;
    }

    :global(.lab-layout > .lds-split-pane__panel) {
      overflow: visible;
    }

    .lab-sidebar {
      grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.75fr);
      min-height: 0;
      border: 0.1rem solid var(--color-lds-toolbar-border);
      border-radius: var(--lds-shape-rest);
    }

    .gallery-sidebar-heading {
      grid-column: 1 / -1;
    }

    .lab-content {
      min-height: 0;
      padding-inline: 0;
      padding-bottom: 0;
    }

    .theme-dock > p {
      max-width: none;
    }
  }

  @media (max-width: 42rem) {
    .lab-shell {
      gap: 0.35rem;
      padding: 0.35rem;
    }

    .lab-header {
      grid-template-columns: auto minmax(0, 1fr);
      gap: 0.5rem;
    }

    .gallery-header-status {
      display: none;
    }

    .gallery-header-tools {
      justify-self: end;
    }

    .gallery-density-control > span {
      display: none;
    }

    :global(.gallery-overview) {
      display: grid;
      align-items: start;
      gap: 0.85rem;
    }

    .gallery-overview__metadata {
      justify-content: flex-start;
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

    :global(.icon-button-lab) {
      display: grid;
      align-items: start;
    }

    .icon-button-rows {
      justify-content: flex-start;
    }

    :global(.toolbar-lab) {
      display: grid;
      align-items: start;
    }

    .list-lab-header,
    .data-table-lab-header {
      display: grid;
      align-items: start;
    }

    .text-field-grid,
    .choice-field-grid,
    .menu-lab,
    .badge-lab,
    .navigation-lab,
    .card-lab,
    .dialog-lab,
    .split-pane-lab {
      grid-template-columns: minmax(0, 1fr);
    }

    .lab-sidebar {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 30rem) {
    :global(.gallery-quick-jumps) {
      display: none;
    }

    .gallery-overview__metadata {
      display: none;
    }
  }
</style>
