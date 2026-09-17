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
    NavigationRail,
    NavigationRailItem,
    NavigationTree,
    NavigationTreeItem,
    PrimaryButton,
    Radio,
    RadioGroup,
    Select,
    SplitPane,
    Switch,
    Tag,
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
    type NavigationRailValue,
    type NavigationTreeValue,
    type RadioValue,
  } from './lib'

  let expressiveMotion = false
  let notifications = true
  let displayName = ''
  let email = 'fish@lipoly.ink'
  let viewMode: string | number = 'list'
  let lastAction = '尚无操作'
  let boldActive = true
  let italicActive = false
  let accessLevel: ListboxValue | undefined = 'maintainer'
  let invalidAccessLevel: ListboxValue | undefined
  let reviewer: ListboxValue | undefined = 'lipo'
  let missingReviewer: ListboxValue | undefined
  let owner: ListboxValue | undefined = 'lipo'
  let themeMode: RadioValue | undefined = 'system'
  let defaultVisibility: RadioValue | undefined
  let compactRows = true
  let liveSync = false
  let selectedWorkspace: ListValue | undefined = 'litho'
  let workspaceLayout: string | number = 'list'
  let workspaceActivity = '就绪'
  let selectedWorkItems: DataTableValue[] = ['keyboard']
  let workItemActivity = '就绪'
  let menuActivity = '就绪'
  let showArchivedWorkspaces = false
  let compactMenuMetadata = true
  let workspaceSort: MenuValue = 'recent'
  let activeLabSection: NavigationTreeValue | undefined = 'button-lab-title'
  let navigationTreePreview: NavigationTreeValue | undefined = 'tree-overview'
  let navigationRailPreview: NavigationRailValue | undefined = 'rail-overview'
  let navigationRailExpanded = false
  let projectTags: Array<{
    label: string
    tone: 'neutral' | 'primary' | 'secondary' | 'tertiary'
  }> = [
    { label: 'Svelte', tone: 'primary' },
    { label: 'TypeScript', tone: 'secondary' },
    { label: 'Material', tone: 'tertiary' },
  ]
  let reviewTagVisible = true
  let navigationTab = 'overview'
  let summaryDialogOpen = false
  let editDialogOpen = false
  let dialogWorkspaceName = 'Litho.'
  let alertDialogOpen = false
  let wideDialogOpen = false
  let galleryDensity: string | number = 'compact'
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

  function removeProjectTag(label: string) {
    projectTags = projectTags.filter((tag) => tag.label !== label)
  }

  function workspaceLabel(value: ListValue | undefined): string {
    const labels: Record<string, string> = {
      litho: 'Litho 设计系统',
      aurora: 'Aurora 研究',
      atlas: 'Atlas 迁移',
      legacy: '旧版导入',
    }

    return value === undefined ? '未选择' : labels[String(value)] ?? String(value)
  }

  function navigationRailLabel(value: NavigationRailValue | undefined): string {
    const labels: Record<string, string> = {
      'rail-workspace': '工作区',
      'rail-overview': '概览',
      'rail-activity': '动态',
      'rail-members': '成员',
      'rail-settings': '设置',
      'rail-integrations': '集成',
    }

    return value === undefined ? '未选择' : labels[String(value)] ?? String(value)
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
    { value: 'guest', label: '访客' },
    { value: 'reporter', label: '报告者' },
    { value: 'developer', label: '开发者' },
    { value: 'maintainer', label: '维护者' },
    { value: 'owner', label: '所有者', disabled: true },
  ]

  const peopleOptions: readonly ListboxOption[] = [
    {
      value: 'lipo',
      label: 'LiPolymer',
      keywords: ['设计', 'design', '中国', 'china'],
    },
    {
      value: '1107',
      label: '1107',
      keywords: ['前端', 'frontend', '英国', 'uk'],
    },
    {
      value: 'tsxc',
      label: '星澜曦光',
      keywords: ['硬件', 'hardware', '中国', 'china'],
    },
    {
      value: 'haraguchi',
      label: '正来',
      keywords: ['前端', 'frontend', '中国', 'china'],
    },
    {
      value: 'dbi',
      label: '徒壁先生',
      keywords: ['研究', 'research', '中国', 'china'],
    },
    {
      value: 'archived',
      label: '已归档账户',
      disabled: true,
    },
  ]
</script>

<svelte:head>
  <title>Litho · Controls Gallery</title>
</svelte:head>

<div
  class="lab-shell"
  data-gallery-density={galleryDensity}
  data-lds-density={resolvedGalleryDensity}
>
  <header class="lab-header">
    <div class="gallery-brand">
      <span class="gallery-brand__mark" aria-hidden="true">
        <svg
          class="gallery-brand__logo"
          viewBox="0 0 500 500"
          fill="none"
          focusable="false"
        >
          <path
            class="gallery-brand__logo-back"
            fill-rule="evenodd"
            d="M427 69H159a5 5 0 0 0-5 5v268a5 5 0 0 0 5 5h268a5 5 0 0 0 5-5V74a5 5 0 0 0-5-5Zm-54 55H213a5 5 0 0 0-5 5v160a5 5 0 0 0 5 5h160a5 5 0 0 0 5-5V129a5 5 0 0 0-5-5Z"
          />
          <path
            class="gallery-brand__logo-front"
            fill-rule="evenodd"
            d="M341 153H73a5 5 0 0 0-5 5v268a5 5 0 0 0 5 5h268a5 5 0 0 0 5-5V158a5 5 0 0 0-5-5Zm-54 55H127a5 5 0 0 0-5 5v160a5 5 0 0 0 5 5h160a5 5 0 0 0 5-5V213a5 5 0 0 0-5-5Z"
          />
        </svg>
      </span>
      <span class="gallery-brand__copy">
        <strong>Litho</strong>
        <small>Controls Gallery</small>
      </span>
    </div>

    <div class="gallery-header-status" aria-label="Gallery状态">
      <Badge icon="applications" tone="primary">14 组控件</Badge>
      <Badge
        icon="scale"
        variant="outline"
        title="常规 / 紧凑控件高度"
      >
        {galleryDensity === 'compact' ? '2 / 1.75rem' : '2.375 / 2rem'}
      </Badge>
    </div>

    <div class="gallery-header-tools">
      <Toolbar aria-label="Gallery快速跳转" class="gallery-quick-jumps">
        <Tooltip content="跳转到操作控件">
          <IconButton
            icon="applications"
            label="跳转到操作控件"
            onclick={() => navigateLab('button-lab-title')}
          />
        </Tooltip>
        <Tooltip content="跳转到输入控件">
          <IconButton
            icon="pencil"
            label="跳转到输入控件"
            onclick={() => navigateLab('checkbox-lab-title')}
          />
        </Tooltip>
        <Tooltip content="跳转到布局控件">
          <IconButton
            icon="sidebar"
            label="跳转到布局控件"
            onclick={() => navigateLab('split-pane-lab-title')}
          />
        </Tooltip>
      </Toolbar>

      <div class="gallery-density-control">
        <span>密度</span>
        <ButtonGroup
          mode="options"
          bind:value={galleryDensity}
          aria-label="Gallery密度"
        >
          <Tooltip content="紧凑Gallery">
            <IconButton
              icon="list-bulleted"
              label="紧凑Gallery"
              value="compact"
            />
          </Tooltip>
          <Tooltip content="舒适Gallery">
            <IconButton
              icon="dot-grid"
              label="舒适Gallery"
              value="comfortable"
            />
          </Tooltip>
        </ButtonGroup>
      </div>
    </div>
  </header>

  <SplitPane
    bind:value={gallerySplit}
    label="调整控件目录与画布宽度"
    min={18}
    max={34}
    step={1}
    resetValue={22}
    class="lab-layout"
  >
    {#snippet first()}
      <aside class="lab-sidebar" aria-label="控件目录与主题控制">
        <div class="gallery-sidebar-heading">
          <div>
            <strong>组件目录</strong>
            <small>交互式样例索引</small>
          </div>
          <Badge icon="list-bulleted" variant="outline">14</Badge>
        </div>

      <NavigationTree
        label="Controls Gallery分区"
        bind:value={activeLabSection}
        onvaluechange={navigateLab}
      >
        <NavigationTreeItem label="操作" icon="applications" expanded>
          <NavigationTreeItem
            value="button-lab-title"
            label="按钮"
            icon="play"
          />
          <NavigationTreeItem
            value="toolbar-lab-title"
            label="工具栏"
            icon="settings"
          />
          <NavigationTreeItem
            value="menu-lab-title"
            label="菜单"
            icon="ellipsis_v"
          />
          <NavigationTreeItem
            value="dialog-lab-title"
            label="对话框"
            icon="details-block"
          />
        </NavigationTreeItem>

        <NavigationTreeItem label="集合" icon="list-bulleted" expanded>
          <NavigationTreeItem
            value="list-lab-title"
            label="紧凑列表"
            icon="list-bulleted"
          />
          <NavigationTreeItem
            value="data-table-lab-title"
            label="数据表格"
            icon="table"
          />
          <NavigationTreeItem
            value="badge-lab-title"
            label="徽标与标签"
            icon="status"
          />
          <NavigationTreeItem
            value="card-lab-title"
            label="卡片"
            icon="applications"
          />
          <NavigationTreeItem
            value="split-pane-lab-title"
            label="分割面板"
            icon="sidebar"
          />
        </NavigationTreeItem>

        <NavigationTreeItem label="输入" icon="pencil" expanded>
          <NavigationTreeItem
            value="checkbox-lab-title"
            label="复选框"
            icon="check"
          />
          <NavigationTreeItem
            value="radio-switch-lab-title"
            label="单选框与开关"
            icon="status"
          />
          <NavigationTreeItem
            value="text-field-lab-title"
            label="文本框"
            icon="pencil"
          />
          <NavigationTreeItem
            value="choice-field-lab-title"
            label="选择框与组合框"
            icon="chevron-down"
          />
        </NavigationTreeItem>

        <NavigationTreeItem label="导航" icon="link" expanded>
          <NavigationTreeItem
            value="navigation-lab-title"
            label="树、导航栏与标签页"
            icon="project"
          />
        </NavigationTreeItem>
      </NavigationTree>

      <div
        id="gallery-theme-controls"
        class="theme-dock"
        aria-label="主题控制"
      >
        <div class="theme-dock__heading">
          <div>
            <small>Material 运行时配色预览</small>
          </div>
          <Badge icon="appearance" tone="secondary">实时</Badge>
        </div>
        <ThemeSeedPicker />
        <p>
          在此调整种子颜色或外观模式。
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
          <h1 id="gallery-title">Controls Gallery</h1>
          <p class="lab-kicker">for Litho.</p>
        </div>

        <div class="gallery-overview__metadata" aria-label="Gallery特性">
          <Badge icon="keyboard" tone="primary">键盘优先</Badge>
          <Badge icon="appearance" tone="secondary">动态配色</Badge>
        </div>
      </Card>

      <section class="lab-section" aria-labelledby="button-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">01 / 操作</p>
            <h2 id="button-lab-title">按钮</h2>
          </div>
          <p>比较三种强调层级下的完整交互状态。</p>
        </div>

        <div class="state-table-scroll">
          <table class="state-table">
            <thead>
              <tr>
                <th scope="col">变种</th>
                <th scope="col">静止</th>
                <th scope="col">悬停</th>
                <th scope="col">聚焦</th>
                <th scope="col">按下</th>
                <th scope="col">禁用</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">主要</th>
                <td><PrimaryButton>主要</PrimaryButton></td>
                <td class="forced-state">
                  <PrimaryButton data-demo-state="hover">主要</PrimaryButton>
                </td>
                <td class="forced-state">
                  <PrimaryButton data-demo-state="focus">主要</PrimaryButton>
                </td>
                <td class="forced-state">
                  <PrimaryButton data-demo-state="pressed">主要</PrimaryButton>
                </td>
                <td><PrimaryButton disabled>主要</PrimaryButton></td>
              </tr>
              <tr>
                <th scope="row">色调</th>
                <td><TonalButton>色调</TonalButton></td>
                <td class="forced-state">
                  <TonalButton data-demo-state="hover">色调</TonalButton>
                </td>
                <td class="forced-state">
                  <TonalButton data-demo-state="focus">色调</TonalButton>
                </td>
                <td class="forced-state">
                  <TonalButton data-demo-state="pressed">色调</TonalButton>
                </td>
                <td><TonalButton disabled>色调</TonalButton></td>
              </tr>
              <tr>
                <th scope="row">幽灵</th>
                <td><GhostButton>幽灵</GhostButton></td>
                <td class="forced-state">
                  <GhostButton data-demo-state="hover">幽灵</GhostButton>
                </td>
                <td class="forced-state">
                  <GhostButton data-demo-state="focus">幽灵</GhostButton>
                </td>
                <td class="forced-state">
                  <GhostButton data-demo-state="pressed">幽灵</GhostButton>
                </td>
                <td><GhostButton disabled>幽灵</GhostButton></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="button-group-grid">
          <Card as="article">
            <span>操作 / 相关命令</span>
            <ButtonGroup aria-label="文件操作">
              <PrimaryButton
                expressive={false}
                onclick={() => (lastAction = '下载')}
              >
                下载
              </PrimaryButton>
              <TonalButton onclick={() => (lastAction = '浏览')}>
                浏览
              </TonalButton>
              <GhostButton onclick={() => (lastAction = '删除')}>
                删除
              </GhostButton>
            </ButtonGroup>
            <small>最近操作：{lastAction}</small>
          </Card>

          <Card as="article">
            <span>选项 / 单一活动视图</span>
            <ButtonGroup
              mode="options"
              bind:value={viewMode}
              aria-label="视图模式"
            >
              <GhostButton value="list">列表</GhostButton>
              <GhostButton value="board">看板</GhostButton>
              <GhostButton value="timeline">时间线</GhostButton>
            </ButtonGroup>
            <small>
              当前视图：{viewMode === 'list'
                ? '列表'
                : viewMode === 'board'
                  ? '看板'
                  : '时间线'}
            </small>
          </Card>
        </div>

        <Card class="icon-button-lab">
          <div>
            <span>图标按钮 / 紧凑操作</span>
            <small>采用 GitLab 图标，并应用 Litho 的密度与交互状态。</small>
          </div>

          <div class="icon-button-rows">
            <div
              class="icon-button-row"
              role="group"
              aria-label="图标按钮变种"
            >
              <Tooltip content="编辑">
                <IconButton icon="pencil" label="编辑" />
              </Tooltip>
              <Tooltip content="下载" placement="bottom">
                <IconButton
                  icon="download"
                  label="下载"
                  variant="tonal"
                />
              </Tooltip>
              <Tooltip content="新建">
                <IconButton icon="plus" label="新建" variant="primary" />
              </Tooltip>
              <Tooltip content="移除不可用">
                <IconButton icon="remove" label="移除" disabled />
              </Tooltip>
              <Tooltip content="设置">
                <IconButton icon="settings" label="设置" size="default" />
              </Tooltip>
            </div>

            <ButtonGroup aria-label="格式操作">
              <Tooltip content="粗体">
                <IconButton icon="bold" label="粗体" />
              </Tooltip>
              <Tooltip content="斜体">
                <IconButton icon="italic" label="斜体" />
              </Tooltip>
              <Tooltip content="插入链接">
                <IconButton icon="link" label="插入链接" />
              </Tooltip>
            </ButtonGroup>
          </div>
        </Card>
      </section>

      <section class="lab-section" aria-labelledby="toolbar-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">02 / 复合操作</p>
            <h2 id="toolbar-lab-title">工具栏</h2>
          </div>
          <p>仅保留一个 Tab 停靠点，再用方向键高效浏览命令。</p>
        </div>

        <Card class="toolbar-lab">
          <div>
            <span>文档格式</span>
            <small>Home 与 End 可跳转到工具栏两端。</small>
          </div>

          <Toolbar aria-label="文档格式">
            <Tooltip content="撤销">
              <IconButton icon="redo" label="撤销" class="toolbar-undo" />
            </Tooltip>
            <Tooltip content="重做不可用">
              <IconButton icon="redo" label="重做" disabled />
            </Tooltip>

            <ToolbarSeparator />

            <ButtonGroup aria-label="文本格式">
              <Tooltip content="粗体">
                <IconButton
                  icon="bold"
                  label="粗体"
                  aria-pressed={boldActive}
                  onclick={() => (boldActive = !boldActive)}
                />
              </Tooltip>
              <Tooltip content="斜体">
                <IconButton
                  icon="italic"
                  label="斜体"
                  aria-pressed={italicActive}
                  onclick={() => (italicActive = !italicActive)}
                />
              </Tooltip>
              <Tooltip content="下划线">
                <IconButton icon="underline" label="下划线" />
              </Tooltip>
            </ButtonGroup>

            <ToolbarSeparator />

            <Tooltip content="插入链接">
              <IconButton icon="link" label="插入链接" />
            </Tooltip>
            <Tooltip content="添加评论">
              <IconButton icon="comment" label="添加评论" />
            </Tooltip>
            <Tooltip content="更多操作">
              <IconButton icon="ellipsis_h" label="更多操作" />
            </Tooltip>
          </Toolbar>
        </Card>
      </section>

      <section class="lab-section" aria-labelledby="list-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">03 / 高密度集合</p>
            <h2 id="list-lab-title">紧凑列表</h2>
          </div>
          <p>支持纵向行导航，并在行末保留独立操作。</p>
        </div>

        <div class="list-lab">
          <header class="list-lab-header">
            <div>
              <span>最近工作区</span>
              <small aria-live="polite">
                已选择 {workspaceLabel(selectedWorkspace)} · {workspaceActivity}
              </small>
            </div>

            <Toolbar aria-label="工作区列表控制">
              <Tooltip content="筛选工作区">
                <IconButton
                  icon="filter"
                  label="筛选工作区"
                  onclick={() => (workspaceActivity = '已打开筛选器')}
                />
              </Tooltip>
              <Tooltip content="按最近活动排序">
                <IconButton
                  icon="sort-highest"
                  label="按最近活动排序"
                  onclick={() => (workspaceActivity = '已按活动排序')}
                />
              </Tooltip>

              <ToolbarSeparator />

              <ButtonGroup
                mode="options"
                bind:value={workspaceLayout}
                aria-label="工作区布局"
              >
                <Tooltip content="列表布局">
                  <IconButton
                    icon="list-bulleted"
                    label="列表布局"
                    value="list"
                  />
                </Tooltip>
                <Tooltip content="表格布局">
                  <IconButton icon="table" label="表格布局" value="table" />
                </Tooltip>
              </ButtonGroup>

              <ToolbarSeparator />

              <Tooltip content="新建工作区">
                <IconButton
                  icon="plus"
                  label="新建工作区"
                  variant="tonal"
                  onclick={() => (workspaceActivity = '已请求新建')}
                />
              </Tooltip>
            </Toolbar>
          </header>

          <List
            selectionMode="single"
            bind:value={selectedWorkspace}
            aria-label="最近工作区"
          >
            <ListItem
              value="litho"
              label="Litho 设计系统"
              description="main · 12 项本地更改"
              metadata="4 分钟"
              onclick={() => (workspaceActivity = '已打开 Litho')}
            >
              {#snippet leading()}
                <Icon name="project" />
              {/snippet}
              {#snippet actions()}
                <Toolbar aria-label="Litho 工作区操作">
                  <Tooltip content="打开动态">
                    <IconButton
                      icon="eye"
                      label="打开 Litho 动态"
                      onclick={() => (workspaceActivity = '已打开动态')}
                    />
                  </Tooltip>
                  <Tooltip content="更多操作">
                    <IconButton
                      icon="ellipsis_v"
                      label="更多 Litho 操作"
                      onclick={() => (workspaceActivity = '已打开 Litho 菜单')}
                    />
                  </Tooltip>
                </Toolbar>
              {/snippet}
            </ListItem>

            <ListItem
              value="aurora"
              label="Aurora 研究"
              description="feature/insights · 已请求评审"
              metadata="18 分钟"
              onclick={() => (workspaceActivity = '已打开 Aurora')}
            >
              {#snippet leading()}
                <Icon name="branch" />
              {/snippet}
              {#snippet actions()}
                <Toolbar aria-label="Aurora 工作区操作">
                  <Tooltip content="打开动态">
                    <IconButton
                      icon="eye"
                      label="打开 Aurora 动态"
                      onclick={() => (workspaceActivity = '已打开动态')}
                    />
                  </Tooltip>
                  <Tooltip content="更多操作">
                    <IconButton
                      icon="ellipsis_v"
                      label="更多 Aurora 操作"
                      onclick={() => (workspaceActivity = '已打开 Aurora 菜单')}
                    />
                  </Tooltip>
                </Toolbar>
              {/snippet}
            </ListItem>

            <ListItem
              value="atlas"
              label="Atlas 迁移"
              description="release/2.4 · 流水线运行中"
              metadata="1 小时"
              onclick={() => (workspaceActivity = '已打开 Atlas')}
            >
              {#snippet leading()}
                <Icon name="status-running" />
              {/snippet}
              {#snippet actions()}
                <Toolbar aria-label="Atlas 工作区操作">
                  <Tooltip content="打开流水线">
                    <IconButton
                      icon="status"
                      label="打开 Atlas 流水线"
                      onclick={() => (workspaceActivity = '已打开流水线')}
                    />
                  </Tooltip>
                  <Tooltip content="更多操作">
                    <IconButton
                      icon="ellipsis_v"
                      label="更多 Atlas 操作"
                      onclick={() => (workspaceActivity = '已打开 Atlas 菜单')}
                    />
                  </Tooltip>
                </Toolbar>
              {/snippet}
            </ListItem>

            <ListItem
              value="legacy"
              label="旧版导入"
              description="已归档工作区"
              metadata="已归档"
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
            <p class="section-index">04 / 结构化数据</p>
            <h2 id="data-table-lab-title">数据表格</h2>
          </div>
          <p>保留原生表格语义，并提供高密度选择与行级工具。</p>
        </div>

        <div class="data-table-lab">
          <header class="data-table-lab-header">
            <div>
              <span>进行中的工作项</span>
              <small aria-live="polite">
                已选择 {selectedWorkItems.length} 项 · {workItemActivity}
              </small>
            </div>

            <Toolbar aria-label="工作项表格控制">
              <Tooltip content="筛选工作项">
                <IconButton
                  icon="filter"
                  label="筛选工作项"
                  onclick={() => (workItemActivity = '已打开筛选器')}
                />
              </Tooltip>
              <Tooltip content="选择列">
                <IconButton
                  icon="applications"
                  label="选择列"
                  onclick={() => (workItemActivity = '已打开列选择器')}
                />
              </Tooltip>

              <ToolbarSeparator />

              <Tooltip content="导出工作项">
                <IconButton
                  icon="download"
                  label="导出工作项"
                  variant="tonal"
                  onclick={() => (workItemActivity = '已请求导出')}
                />
              </Tooltip>
            </Toolbar>
          </header>

          <DataTable
            selectionMode="multiple"
            bind:selected={selectedWorkItems}
            aria-label="进行中的工作项"
            onselectionchange={(selection) =>
              (workItemActivity = `已选择 ${selection.length} 行`)}
          >
            <thead>
              <tr>
                <DataTableSelectAll label="选择所有行" />
                <th scope="col">工作项</th>
                <th scope="col">状态</th>
                <th scope="col">负责人</th>
                <th scope="col" class="lds-data-table__cell--numeric">
                  更新时间
                </th>
                <th scope="col">
                  <span class="sr-only">操作</span>
                </th>
              </tr>
            </thead>

            <tbody>
              <DataTableRow
                value="tokens"
                selectionLabel="选择令牌分类审查"
              >
                <td>
                  <div class="lds-data-table__cell-stack">
                    <span class="lds-data-table__primary">
                      令牌分类审查
                    </span>
                    <span class="lds-data-table__secondary">
                      #42 · 设计系统
                    </span>
                  </div>
                </td>
                <td>
                  <Badge tone="tertiary" icon="review-list">评审中</Badge>
                </td>
                <td>陈米拉</td>
                <td class="lds-data-table__cell--numeric">4 分钟</td>
                <td class="lds-data-table__actions-cell">
                  <Toolbar aria-label="令牌分类审查操作">
                    <Tooltip content="编辑工作项">
                      <IconButton
                        icon="pencil"
                        label="编辑令牌分类审查"
                        onclick={() => (workItemActivity = '已打开编辑器')}
                      />
                    </Tooltip>
                    <Tooltip content="更多操作">
                      <IconButton
                        icon="ellipsis_v"
                        label="更多令牌分类审查操作"
                        onclick={() => (workItemActivity = '已打开行菜单')}
                      />
                    </Tooltip>
                  </Toolbar>
                </td>
              </DataTableRow>

              <DataTableRow
                value="keyboard"
                selectionLabel="选择数据表格键盘导航"
              >
                <td>
                  <div class="lds-data-table__cell-stack">
                    <span class="lds-data-table__primary">
                      数据表格键盘导航
                    </span>
                    <span class="lds-data-table__secondary">
                      #38 · 无障碍
                    </span>
                  </div>
                </td>
                <td>
                  <Badge tone="primary" icon="status-running">
                    进行中
                  </Badge>
                </td>
                <td>金索拉</td>
                <td class="lds-data-table__cell--numeric">18 分钟</td>
                <td class="lds-data-table__actions-cell">
                  <Toolbar aria-label="键盘导航操作">
                    <Tooltip content="打开工作项">
                      <IconButton
                        icon="eye"
                        label="打开键盘导航工作项"
                        onclick={() => (workItemActivity = '已打开工作项')}
                      />
                    </Tooltip>
                    <Tooltip content="更多操作">
                      <IconButton
                        icon="ellipsis_v"
                        label="更多键盘导航操作"
                        onclick={() => (workItemActivity = '已打开行菜单')}
                      />
                    </Tooltip>
                  </Toolbar>
                </td>
              </DataTableRow>

              <DataTableRow
                value="tooltip"
                selectionLabel="选择工具提示碰撞处理"
              >
                <td>
                  <div class="lds-data-table__cell-stack">
                    <span class="lds-data-table__primary">
                      工具提示碰撞处理
                    </span>
                    <span class="lds-data-table__secondary">
                      #31 · 交互
                    </span>
                  </div>
                </td>
                <td>
                  <Badge variant="outline" icon="check-circle">就绪</Badge>
                </td>
                <td>萨姆·里维拉</td>
                <td class="lds-data-table__cell--numeric">1 小时</td>
                <td class="lds-data-table__actions-cell">
                  <Toolbar aria-label="工具提示碰撞处理操作">
                    <Tooltip content="开始工作">
                      <IconButton
                        icon="play"
                        label="开始工具提示碰撞处理"
                        onclick={() => (workItemActivity = '工作已开始')}
                      />
                    </Tooltip>
                    <Tooltip content="更多操作">
                      <IconButton
                        icon="ellipsis_v"
                        label="更多工具提示碰撞处理操作"
                        onclick={() => (workItemActivity = '已打开行菜单')}
                      />
                    </Tooltip>
                  </Toolbar>
                </td>
              </DataTableRow>

              <DataTableRow
                value="legacy"
                selectionLabel="选择旧版导入器清理"
                disabled
              >
                <td>
                  <div class="lds-data-table__cell-stack">
                    <span class="lds-data-table__primary">
                      旧版导入器清理
                    </span>
                    <span class="lds-data-table__secondary">
                      #12 · 已归档
                    </span>
                  </div>
                </td>
                <td>
                  <Badge tone="error" icon="entity-blocked">受阻</Badge>
                </td>
                <td>尼科·彼得罗娃</td>
                <td class="lds-data-table__cell--numeric">2 天</td>
                <td class="lds-data-table__actions-cell"></td>
              </DataTableRow>
            </tbody>
          </DataTable>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="checkbox-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">05 / 选择</p>
            <h2 id="checkbox-lab-title">复选框</h2>
          </div>
          <p>通过点击或键盘操作检查真实交互状态。</p>
        </div>

        <div class="checkbox-grid">
          <Card as="article">
            <span>可交互 / 未选中</span>
            <Checkbox bind:checked={expressiveMotion}>
              表现型动效
            </Checkbox>
          </Card>

          <Card as="article">
            <span>可交互 / 已选中</span>
            <Checkbox bind:checked={notifications}>
              通知
            </Checkbox>
          </Card>

          <Card as="article">
            <span>禁用 / 未选中</span>
            <Checkbox disabled>
              表现型动效
            </Checkbox>
          </Card>

          <Card as="article">
            <span>禁用 / 已选中</span>
            <Checkbox checked disabled>
              通知
            </Checkbox>
          </Card>

          <Card as="article">
            <span>可交互 / 混合状态</span>
            <Checkbox indeterminate>
              部分选中
            </Checkbox>
          </Card>

          <Card as="article" class="forced-state">
            <span>悬停 · 聚焦 · 按下</span>
            <div class="selection-state-probe">
              <Checkbox data-demo-state="hover">悬停</Checkbox>
              <Checkbox data-demo-state="focus" checked>聚焦</Checkbox>
              <Checkbox data-demo-state="pressed">按下</Checkbox>
            </div>
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="radio-switch-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">06 / 选择语义</p>
            <h2 id="radio-switch-lab-title">单选框与开关</h2>
          </div>
          <p>互斥选择与即时二元设置均保留原生语义。</p>
        </div>

        <div class="selection-control-grid">
          <Card as="article">
            <span>单选组 / 水平</span>
            <RadioGroup
              legend="主题模式"
              orientation="horizontal"
              helperText="默认跟随当前工作区。"
              bind:value={themeMode}
            >
              <Radio value="system">跟随系统</Radio>
              <Radio value="light">浅色</Radio>
              <Radio value="dark">深色</Radio>
              <Radio value="contrast" disabled>高对比度</Radio>
            </RadioGroup>
          </Card>

          <Card as="article">
            <span>单选组 / 错误</span>
            <RadioGroup
              legend="默认可见性"
              error="请选择可见性级别。"
              required
              bind:value={defaultVisibility}
            >
              <Radio value="private">私有</Radio>
              <Radio value="internal">内部</Radio>
              <Radio value="public">公开</Radio>
            </RadioGroup>
          </Card>

          <Card as="article">
            <span>开关 / 可交互</span>
            <div class="switch-stack">
              <Switch bind:checked={compactRows}>紧凑行</Switch>
              <Switch bind:checked={liveSync}>实时同步</Switch>
            </div>
          </Card>

          <Card as="article">
            <span>开关 / 禁用</span>
            <div class="switch-stack">
              <Switch disabled>外部通知</Switch>
              <Switch checked disabled>审计日志</Switch>
            </div>
          </Card>

          <Card as="article" class="forced-state">
            <span>开关 / 悬停 · 聚焦 · 按下</span>
            <div class="selection-state-probe">
              <Switch data-demo-state="hover">悬停</Switch>
              <Switch data-demo-state="focus" checked>聚焦</Switch>
              <Switch data-demo-state="pressed">按下</Switch>
            </div>
          </Card>

          <Card as="article" class="forced-state">
            <span>单选框 / 悬停 · 聚焦 · 按下</span>
            <RadioGroup legend="状态序列" orientation="horizontal">
              <Radio value="hover" data-demo-state="hover">悬停</Radio>
              <Radio value="focus" data-demo-state="focus">聚焦</Radio>
              <Radio value="pressed" data-demo-state="pressed">按下</Radio>
            </RadioGroup>
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="text-field-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">07 / 输入</p>
            <h2 id="text-field-lab-title">文本框</h2>
          </div>
          <p>检查内容层级、焦点、错误及不可编辑状态。</p>
        </div>

        <div class="text-field-grid">
          <Card as="article">
            <span>默认 / 空值</span>
            <TextField
              label="显示名称"
              placeholder="LiPolymer"
              helperText="按 Enter 提交并释放焦点。"
              commitOnEnter
              bind:value={displayName}
            />
          </Card>

          <Card as="article">
            <span>默认 / 已填写</span>
            <TextField
              label="电子邮箱"
              type="email"
              helperText="用于接收账户通知。"
              bind:value={email}
            />
          </Card>

          <Card as="article">
            <span>错误</span>
            <TextField
              label="电子邮箱"
              type="email"
              value="not-an-email"
              error="请输入有效的电子邮箱地址。"
              required
            />
          </Card>

          <Card as="article">
            <span>只读</span>
            <TextField
              label="主题来源"
              value="Material 种子颜色"
              helperText="由当前主题生成。"
              readonly
            />
          </Card>

          <Card as="article">
            <span>禁用</span>
            <TextField
              label="工作区"
              value="不可用"
              helperText="此字段无法编辑。"
              disabled
            />
          </Card>

          <Card as="article" class="forced-state">
            <span>悬停</span>
            <TextField
              label="仓库路径"
              value="litho/design-system"
              data-demo-state="hover"
            />
          </Card>

          <Card as="article" class="forced-state">
            <span>聚焦</span>
            <TextField
              label="分支"
              value="main"
              data-demo-state="focus"
            />
          </Card>

          <Card as="article">
            <span>只读 / 错误</span>
            <TextField
              label="生成的标识符"
              value="无效标识符"
              error="生成的值无法发布。"
              readonly
            />
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="menu-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">08 / 浮动操作</p>
            <h2 id="menu-lab-title">菜单</h2>
          </div>
          <p>
            紧凑命令菜单与选项菜单共享同一套浮动交互模型。
          </p>
        </div>

        <div class="menu-lab">
          <Card as="article" class="menu-card">
            <div class="menu-lab__copy">
              <span>命令 + 持久选项</span>
              <small>{menuActivity}</small>
            </div>

            <Menu label="工作区操作">
              {#snippet trigger()}
                <TonalButton class="menu-trigger">
                  工作区
                  <Icon name="chevron-down" size={14} />
                </TonalButton>
              {/snippet}

              <MenuLabel>工作区</MenuLabel>
              <MenuItem
                      label="打开工作区"
                      shortcut="↵"
                      onclick={() => (menuActivity = '已打开工作区')}
              >
                {#snippet leading()}
                  <Icon name="project" size={14} />
                {/snippet}
              </MenuItem>
              <MenuItem
                      label="重命名"
                      shortcut="F2"
                      onclick={() => (menuActivity = '已请求重命名')}
              >
                {#snippet leading()}
                  <Icon name="pencil" size={14} />
                {/snippet}
              </MenuItem>
              <MenuItem label="导出" shortcut="Ctrl E" disabled>
                {#snippet leading()}
                  <Icon name="download" size={14} />
                {/snippet}
              </MenuItem>

              <MenuSeparator />
              <MenuCheckboxItem
                      label="显示已归档项"
                      bind:checked={showArchivedWorkspaces}
              />
              <MenuCheckboxItem
                      label="紧凑元数据"
                      bind:checked={compactMenuMetadata}
              />

              <MenuSeparator />
              <MenuLabel>排序方式</MenuLabel>
              <MenuRadioGroup label="工作区排序" bind:value={workspaceSort}>
                <MenuRadioItem value="recent" label="最近活动" />
                <MenuRadioItem value="name" label="名称" />
                <MenuRadioItem value="created" label="创建日期" />
              </MenuRadioGroup>

              <MenuSeparator />
              <MenuItem
                      label="归档工作区"
                      variant="danger"
                      onclick={() => (menuActivity = '已请求归档')}
              >
                {#snippet leading()}
                  <Icon name="archive" size={14} />
                {/snippet}
              </MenuItem>
            </Menu>
          </Card>

          <Card as="article" class="menu-card">
            <div class="menu-lab__copy">
              <span>末端对齐的上下文菜单</span>
              <small>支持方向键、Home/End 与输入搜索。</small>
            </div>

            <Menu label="上下文操作" align="end">
              {#snippet trigger()}
                <IconButton icon="ellipsis_v" label="打开上下文菜单" />
              {/snippet}

              <MenuItem
                      label="编辑"
                      shortcut="E"
                      onclick={() => (menuActivity = '已请求编辑')}
              >
                {#snippet leading()}
                  <Icon name="pencil" size={14} />
                {/snippet}
              </MenuItem>
              <MenuItem
                      label="下载"
                      shortcut="D"
                      onclick={() => (menuActivity = '已请求下载')}
              >
                {#snippet leading()}
                  <Icon name="download" size={14} />
                {/snippet}
              </MenuItem>
              <MenuSeparator />
              <MenuItem label="移除" variant="danger">
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
            <p class="section-index">09 / 输入选择</p>
            <h2 id="choice-field-lab-title">选择框与组合框</h2>
          </div>
          <p>
            直接选择与键盘筛选搜索共享同一套连接式展开面板。
          </p>
        </div>

        <div class="choice-field-grid">
          <Card as="article">
            <span>选择框 / 已填写</span>
            <Select
              label="访问级别"
              options={accessOptions}
              placeholder="请选择访问级别"
              requiredMessage="请选择一个选项。"
              helperText="当前策略下无法选择所有者。"
              bind:value={accessLevel}
            />
          </Card>

          <Card as="article">
            <span>选择框 / 错误</span>
            <Select
              label="默认访问级别"
              options={accessOptions}
              placeholder="选择一个级别"
              error="请选择默认访问级别。"
              requiredMessage="请选择一个选项。"
              required
              bind:value={invalidAccessLevel}
            />
          </Card>

          <Card as="article">
            <span>选择框 / 禁用</span>
            <Select
              label="工作流"
              options={accessOptions}
              value="developer"
              placeholder="请选择工作流"
              requiredMessage="请选择一个选项。"
              helperText="由你的组织管理。"
              disabled
            />
          </Card>

          <Card as="article">
            <span>组合框 / 可搜索</span>
            <Combobox
              label="评审者"
              options={peopleOptions}
              placeholder="按姓名、团队或地点搜索"
              helperText="使用方向键导航，按 Enter 选择。"
              emptyText="没有匹配结果"
              toggleLabel="展开或收起选项"
              requiredMessage="请选择一个选项。"
              bind:value={reviewer}
            />
          </Card>

          <Card as="article">
            <span>组合框 / 错误</span>
            <Combobox
              label="必选评审者"
              options={peopleOptions}
              placeholder="搜索人员"
              error="请至少分配一名评审者。"
              emptyText="没有匹配结果"
              toggleLabel="展开或收起选项"
              requiredMessage="请选择一个选项。"
              required
              bind:value={missingReviewer}
            />
          </Card>

          <Card as="article">
            <span>组合框 / 只读</span>
            <Combobox
              label="所有者"
              options={peopleOptions}
              helperText="继承自上级工作区。"
              emptyText="没有匹配结果"
              toggleLabel="展开或收起选项"
              requiredMessage="请选择一个选项。"
              readonly
              bind:value={owner}
            />
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="badge-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">10 / 元数据</p>
            <h2 id="badge-lab-title">徽标与标签</h2>
          </div>
          <p>
            状态元数据与可移除标签共享能够感知种子颜色的语义色调。
          </p>
        </div>

        <div class="badge-lab">
          <Card as="article">
            <span>柔和 / 语义图标</span>
            <div class="badge-row">
              <Badge icon="status-neutral">中性</Badge>
              <Badge tone="primary" icon="status-running">主要</Badge>
              <Badge tone="secondary" icon="status-scheduled">
                次要
              </Badge>
              <Badge tone="tertiary" icon="review-list">第三色</Badge>
              <Badge tone="error" icon="status-failed">错误</Badge>
            </div>
          </Card>

          <Card as="article">
            <span>轮廓 / 语义图标</span>
            <div class="badge-row">
              <Badge variant="outline" icon="status-neutral">中性</Badge>
              <Badge tone="primary" variant="outline" icon="progress">
                主要
              </Badge>
              <Badge tone="secondary" variant="outline" icon="clock">
                次要
              </Badge>
              <Badge tone="tertiary" variant="outline" icon="review-checkmark">
                第三色
              </Badge>
              <Badge tone="error" variant="outline" icon="error">错误</Badge>
            </div>
          </Card>

          <Card as="article">
            <span>标签 / 可移除的柔和标签</span>
            <div class="badge-row">
              {#each projectTags as tag (tag.label)}
                <Tag
                  icon="tag"
                  tone={tag.tone}
                  removeLabel={`移除 ${tag.label}`}
                  onremove={() => removeProjectTag(tag.label)}
                >
                  {tag.label}
                </Tag>
              {:else}
                <small>所有项目标签均已移除。</small>
              {/each}
            </div>
          </Card>

          <Card as="article">
            <span>标签 / 轮廓与禁用移除</span>
            <div class="badge-row">
              {#if reviewTagVisible}
                <Tag
                  icon="label"
                  tone="primary"
                  variant="outline"
                  removeLabel="移除评审标签"
                  onremove={() => (reviewTagVisible = false)}
                >
                  评审
                </Tag>
              {/if}

              <Tag
                icon="bookmark"
                variant="outline"
                removeLabel="移除受保护标签"
                onremove={() => undefined}
                disabled
              >
                受保护
              </Tag>
            </div>
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="navigation-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">11 / 导航</p>
            <h2 id="navigation-lab-title">树、导航栏与标签页</h2>
          </div>
          <p>
            层级目的地与同级视图分别采用适合自身的键盘模型。
          </p>
        </div>

        <div class="navigation-lab">
          <Card as="article">
            <span>导航树 / 嵌套目的地</span>
            <NavigationTree
              label="工作区导航预览"
              bind:value={navigationTreePreview}
            >
              <NavigationTreeItem label="工作区" icon="project" expanded>
                <NavigationTreeItem
                  value="tree-overview"
                  label="概览"
                  icon="applications"
                />
                <NavigationTreeItem
                  value="tree-activity"
                  label="动态"
                  icon="status-running"
                />
              </NavigationTreeItem>

              <NavigationTreeItem label="管理" icon="settings" expanded>
                <NavigationTreeItem
                  value="tree-members"
                  label="成员"
                  icon="users"
                />
                <NavigationTreeItem
                  value="tree-integrations"
                  label="集成"
                  icon="link"
                  disabled
                />
              </NavigationTreeItem>
            </NavigationTree>
          </Card>

          <Card as="article">
            <span>导航栏 / 高频目的地</span>
            <div class="navigation-rail-demo">
              <NavigationRail
                label="工作区快速导航"
                bind:value={navigationRailPreview}
                bind:expanded={navigationRailExpanded}
                expandLabel="展开导航栏"
                collapseLabel="收起导航栏"
              >
                <NavigationRailItem
                  value="rail-workspace"
                  label="工作区"
                  icon="project"
                >
                  <NavigationRailItem
                    value="rail-overview"
                    label="概览"
                    icon="applications"
                  />
                  <NavigationRailItem
                    value="rail-activity"
                    label="动态"
                    icon="status-running"
                  />
                </NavigationRailItem>
                <NavigationRailItem
                  value="rail-members"
                  label="成员"
                  icon="users"
                />
                <NavigationRailItem
                  value="rail-settings"
                  label="设置"
                  icon="settings"
                />
                <NavigationRailItem
                  value="rail-integrations"
                  label="集成不可用"
                  icon="link"
                  disabled
                />
              </NavigationRail>

              <div class="navigation-rail-copy">
                <strong>当前目的地</strong>
                <span>{navigationRailLabel(navigationRailPreview)}</span>
                <small>
                  {navigationRailExpanded
                    ? '已展开的紧凑侧栏'
                    : '已收起的纯图标导航栏'}
                </small>
              </div>
            </div>
          </Card>

          <Card as="article">
            <span>标签页 / 自动激活</span>
            <Tabs label="工作区视图" bind:value={navigationTab}>
              {#snippet tabs()}
                <Tab value="overview" icon="project">概览</Tab>
                <Tab value="activity" icon="status-running">动态</Tab>
                <Tab value="notes" icon="comment">备注</Tab>
              {/snippet}

              <TabPanel value="overview">
                <div class="navigation-panel-copy">
                  <strong>概览</strong>
                  <span>无需离开页面即可查看稳定的项目上下文。</span>
                </div>
              </TabPanel>

              <TabPanel value="activity">
                <div class="navigation-panel-copy">
                  <strong>动态</strong>
                  <span>为快速浏览而优化的最近更改。</span>
                </div>
              </TabPanel>

              <TabPanel value="notes">
                <div class="navigation-panel-copy">
                  <strong>备注</strong>
                  <span>当前工作区的补充信息。</span>
                </div>
              </TabPanel>
            </Tabs>
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="card-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">12 / 容器</p>
            <h2 id="card-lab-title">卡片</h2>
          </div>
          <p>
            具有明确层级与密度的非交互分组表面。
          </p>
        </div>

        <div class="card-lab">
          <Card as="article">
            <span>轻微 / 默认密度</span>
            <div class="card-demo-copy">
              <h3>安静分组</h3>
              <p>融入父容器，同时保持内容节奏。</p>
            </div>
          </Card>

          <Card as="article" variant="filled" density="compact">
            <span>填充 / 紧凑密度</span>
            <div class="card-demo-copy">
              <h3>高密度摘要</h3>
              <p>当相邻分组需要区分时，使用更明确的表面。</p>
            </div>
          </Card>

          <Card as="article" variant="outlined">
            <span>轮廓 / 默认密度</span>
            <div class="card-demo-copy">
              <h3>明确边界</h3>
              <p>保持填充安静，让容器边缘承担区分作用。</p>
            </div>
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="dialog-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">13 / 浮层</p>
            <h2 id="dialog-lab-title">对话框</h2>
          </div>
          <p>
            具备焦点约束、明确层级及可逆出现动效的模态工作表面。
          </p>
        </div>

        <div class="dialog-lab">
          <Card as="article" class="dialog-card">
            <span>紧凑 / 表面聚焦</span>
            <div class="dialog-demo-copy">
              <h3>评审摘要</h3>
              <p>简短且低干扰的确认表面。</p>
            </div>

            <Dialog
              bind:open={summaryDialogOpen}
              size="compact"
              initialFocus="surface"
              closeLabel="关闭对话框"
            >
              {#snippet trigger()}
                <TonalButton>打开摘要</TonalButton>
              {/snippet}

              {#snippet title()}准备发布{/snippet}

              {#snippet description()}
                分享此工作区前，请检查最终状态。
              {/snippet}

              <div class="dialog-preview">
                <Icon name="status_success" size={16} />
                <div>
                  <strong>所有检查均已通过</strong>
                  <span>将发布 8 个组件和 24 个令牌。</span>
                </div>
              </div>

              {#snippet actions()}
                <DialogClose>
                  <GhostButton>暂不</GhostButton>
                </DialogClose>
                <DialogClose>
                  <PrimaryButton expressive={false}>发布</PrimaryButton>
                </DialogClose>
              {/snippet}
            </Dialog>
          </Card>

          <Card as="article" class="dialog-card">
            <span>默认 / 显式初始焦点</span>
            <div class="dialog-demo-copy">
              <h3>编辑工作区</h3>
              <p>紧凑表单让任务留在当前上下文中。</p>
            </div>

            <Dialog bind:open={editDialogOpen} closeLabel="关闭对话框">
              {#snippet trigger()}
                <TonalButton>编辑详情</TonalButton>
              {/snippet}

              {#snippet title()}工作区详情{/snippet}

              {#snippet description()}
                更新导航与最近活动中使用的名称。
              {/snippet}

              <TextField
                label="工作区名称"
                bind:value={dialogWorkspaceName}
                data-lds-dialog-initial-focus=""
                commitOnEnter
              />

              {#snippet actions()}
                <DialogClose>
                  <GhostButton>取消</GhostButton>
                </DialogClose>
                <DialogClose>
                  <PrimaryButton expressive={false}>保存更改</PrimaryButton>
                </DialogClose>
              {/snippet}
            </Dialog>
          </Card>

          <Card as="article" class="dialog-card">
            <span>警告 / 最低破坏性焦点</span>
            <div class="dialog-demo-copy">
              <h3>放弃更改</h3>
              <p>要求明确作出决定，并忽略背景点击。</p>
            </div>

            <AlertDialog bind:open={alertDialogOpen} size="compact">
              {#snippet trigger()}
                <TonalButton>打开警告</TonalButton>
              {/snippet}

              {#snippet title()}放弃未保存的更改？{/snippet}

              {#snippet description()}
                当前工作区名称将恢复为已保存的值。
              {/snippet}

              <div class="dialog-alert-copy">
                <Icon name="warning" size={16} />
                <p>离开编辑器后，此操作无法撤销。</p>
              </div>

              {#snippet actions()}
                <DialogClose>
                  <GhostButton data-lds-dialog-initial-focus="">
                    继续编辑
                  </GhostButton>
                </DialogClose>
                <DialogClose>
                  <PrimaryButton expressive={false}>
                    放弃更改
                  </PrimaryButton>
                </DialogClose>
              {/snippet}
            </AlertDialog>
          </Card>

          <Card as="article" class="dialog-card">
            <span>宽幅 / 溢出 + 嵌套浮层</span>
            <div class="dialog-demo-copy">
              <h3>评审工作区</h3>
              <p>验证正文滚动及位于模态层上方的菜单。</p>
            </div>

            <Dialog
              bind:open={wideDialogOpen}
              size="wide"
              closeLabel="关闭对话框"
              style="--lds-dialog-max-height: min(26rem, calc(100dvh - 2rem))"
            >
              {#snippet trigger()}
                <TonalButton>打开宽幅对话框</TonalButton>
              {/snippet}

              {#snippet title()}工作区评审{/snippet}

              {#snippet description()}
                验证滚动、焦点约束和嵌套浮层顺序。
              {/snippet}

              <div class="dialog-validation-list">
                <div class="dialog-validation-row">
                  <strong>显示选项</strong>
                  <span>嵌套菜单应在对话框上方保持焦点。</span>
                  <Menu label="对话框显示选项">
                    {#snippet trigger()}
                      <TonalButton>打开嵌套菜单</TonalButton>
                    {/snippet}
                    <MenuItem label="紧凑元数据">
                      {#snippet leading()}
                        <Icon name="list-bulleted" size={14} />
                      {/snippet}
                    </MenuItem>
                    <MenuItem label="显示动态">
                      {#snippet leading()}
                        <Icon name="history" size={14} />
                      {/snippet}
                    </MenuItem>
                  </Menu>
                </div>
                <div class="dialog-validation-row">
                  <strong>键盘焦点约束</strong>
                  <span>Tab 与 Shift+Tab 始终停留在活动对话框内。</span>
                </div>
                <div class="dialog-validation-row">
                  <strong>溢出归属</strong>
                  <span>展开稳定后，仅此正文区域滚动。</span>
                </div>
                <div class="dialog-validation-row">
                  <strong>Escape 顺序</strong>
                  <span>Escape 会先关闭嵌套菜单，再关闭对话框。</span>
                </div>
                <div class="dialog-validation-row">
                  <strong>焦点恢复</strong>
                  <span>关闭后，焦点返回宽幅对话框触发按钮。</span>
                </div>
              </div>

              {#snippet actions()}
                <DialogClose>
                  <PrimaryButton expressive={false}>完成</PrimaryButton>
                </DialogClose>
              {/snippet}
            </Dialog>
          </Card>
        </div>
      </section>

      <section class="lab-section" aria-labelledby="split-pane-lab-title">
        <div class="section-heading">
          <div>
            <p class="section-index">14 / 布局</p>
            <h2 id="split-pane-lab-title">分割面板</h2>
          </div>
          <p>
            支持指针捕获、键盘控制和明确边界的可调整工作区域。
          </p>
        </div>

        <div class="split-pane-lab">
          <Card as="article" density="compact" class="split-pane-card">
            <div class="split-pane-demo-heading">
              <span>水平 / {Math.round(workspaceSplit)}%</span>
              <small>方向键 · Shift ×5 · Home/End · 双击</small>
            </div>

            <SplitPane
              bind:value={workspaceSplit}
              label="调整导航与工作区宽度"
              min={22}
              max={68}
              resetValue={34}
              class="split-pane-demo"
            >
              {#snippet first()}
                <div class="split-demo-panel split-demo-navigation">
                  <strong>工作区</strong>
                  <span class="split-demo-row split-demo-row--selected">
                    概览
                  </span>
                  <span class="split-demo-row">动态</span>
                  <span class="split-demo-row">组件</span>
                  <span class="split-demo-row">设置</span>
                </div>
              {/snippet}

              {#snippet second()}
                <div class="split-demo-panel split-demo-workspace">
                  <div>
                    <small>活动文档</small>
                    <strong>设计系统笔记</strong>
                  </div>
                  <p>
                    拖动分隔条，聚焦后使用左/右方向键，或双击恢复默认比例。
                  </p>
                </div>
              {/snippet}
            </SplitPane>
          </Card>

          <Card as="article" density="compact" class="split-pane-card">
            <div class="split-pane-demo-heading">
              <span>垂直 / {Math.round(inspectorSplit)}%</span>
              <small>上/下方向键跟随可视分割轴</small>
            </div>

            <SplitPane
              bind:value={inspectorSplit}
              label="调整编辑器与检查器高度"
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
                  <strong>检查器</strong>
                  <span>角色：separator</span>
                  <span>数值：{Math.round(inspectorSplit)}%</span>
                </div>
              {/snippet}
            </SplitPane>
          </Card>
        </div>
      </section>

      <footer class="gallery-footer">
        <div class="gallery-footer__identity">
          <span class="gallery-footer__mark" aria-hidden="true">
            <svg viewBox="0 0 500 500" fill="none" focusable="false">
              <path
                class="gallery-footer__logo-back"
                fill-rule="evenodd"
                d="M427 69H159a5 5 0 0 0-5 5v268a5 5 0 0 0 5 5h268a5 5 0 0 0 5-5V74a5 5 0 0 0-5-5Zm-54 55H213a5 5 0 0 0-5 5v160a5 5 0 0 0 5 5h160a5 5 0 0 0 5-5V129a5 5 0 0 0-5-5Z"
              />
              <path
                class="gallery-footer__logo-front"
                fill-rule="evenodd"
                d="M341 153H73a5 5 0 0 0-5 5v268a5 5 0 0 0 5 5h268a5 5 0 0 0 5-5V158a5 5 0 0 0-5-5Zm-54 55H127a5 5 0 0 0-5 5v160a5 5 0 0 0 5 5h160a5 5 0 0 0 5-5V213a5 5 0 0 0-5-5Z"
              />
            </svg>
          </span>

          <div>
            <strong>Litho.</strong>
            <p>神人设计语言。</p>
          </div>
        </div>

        <nav class="gallery-footer__links" aria-label="项目链接">
          <a href="https://github.com/LiPolymer/LithoSvelte">
            <Icon name="github" size={14} />
            <span>GitHub</span>
            <Icon name="external-link" size={12} />
          </a>
          <a href="https://gitlab.com/LiPolymer/LithoSvelte">
            <Icon name="git" size={14} />
            <span>GitLab</span>
            <Icon name="external-link" size={12} />
          </a>
        </nav>

        <div class="gallery-footer__meta">
          <span>Svelte 5 · TypeScript · Tailwind CSS 4 · 正文字体使用 <a href="https://hyperos.mi.com/font">MiSans</a></span>
          <span class="gallery-footer__status">
            <span aria-hidden="true"></span>
            v0.1.0 preview
          </span>
        </div>
      </footer>
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
    width: 2rem;
    height: 2rem;
    flex: 0 0 auto;
  }

  .gallery-brand__logo {
    display: block;
    width: 100%;
    height: 100%;
  }

  .gallery-brand__logo-back {
    fill: var(--color-lds-secondary-content);
  }

  .gallery-brand__logo-front {
    fill: var(--color-lds-primary-content);
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

  .gallery-footer {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    min-width: 0;
    align-items: center;
    gap: 0.8rem 1.5rem;
    padding: 1rem 1.1rem;
    border: 0.1rem solid var(--color-lds-toolbar-border);
    border-radius: var(--radius-lds-md);
    background:
      linear-gradient(
        120deg,
        color-mix(
          in srgb,
          var(--md-sys-color-primary) 5%,
          transparent
        ),
        transparent 42%
      ),
      color-mix(
        in srgb,
        var(--md-sys-color-secondary) 2%,
        var(--md-sys-color-surface)
      );
  }

  .gallery-footer__identity {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.7rem;
  }

  .gallery-footer__mark {
    width: 2.25rem;
    height: 2.25rem;
    flex: 0 0 auto;
  }

  .gallery-footer__mark svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .gallery-footer__logo-back {
    fill: var(--color-lds-secondary-content);
  }

  .gallery-footer__logo-front {
    fill: var(--color-lds-primary-content);
  }

  .gallery-footer__identity > div {
    display: grid;
    min-width: 0;
    gap: 0.15rem;
  }

  .gallery-footer__identity strong {
    font-family: var(--heading);
    font-size: 1rem;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.025em;
  }

  .gallery-footer__identity p,
  .gallery-footer__meta {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.7rem;
  }

  .gallery-footer__identity p {
    line-height: 1.4;
  }

  .gallery-footer__links {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.35rem 0.8rem;
  }

  .gallery-footer__links a {
    display: inline-flex;
    min-height: 2rem;
    align-items: center;
    gap: 0.3rem;
    border-radius: var(--radius-lds-sm);
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.7rem;
    text-decoration-color: color-mix(
      in srgb,
      currentColor 35%,
      transparent
    );
    text-underline-offset: 0.18em;
    transition:
      color var(--lds-motion-duration-fast) var(--lds-motion-easing-state),
      background-color var(--lds-motion-duration-fast)
        var(--lds-motion-easing-state);
  }

  .gallery-footer__links a:hover {
    color: var(--color-lds-primary-content);
  }

  .gallery-footer__links a:focus-visible {
    outline: 0.1rem solid var(--color-lds-selection-focus-ring);
    outline-offset: 0.15rem;
  }

  .gallery-footer__meta {
    display: flex;
    grid-column: 1 / -1;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding-top: 0.65rem;
    border-top: 0.1rem solid var(--color-lds-group-divider);
  }

  .gallery-footer__status {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
  }

  .gallery-footer__status > span {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background: var(--color-lds-primary-content);
    box-shadow: 0 0 0 0.18rem
      color-mix(
        in srgb,
        var(--color-lds-primary-content) 12%,
        transparent
      );
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

  .navigation-rail-demo {
    display: flex;
    min-width: 0;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .navigation-rail-copy {
    display: grid;
    min-width: 0;
    align-content: start;
    gap: 0.15rem;
    padding-block: 0.2rem;
  }

  .navigation-rail-copy strong {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .navigation-rail-copy span,
  .navigation-rail-copy small {
    overflow: hidden;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 0.68rem;
    text-overflow: ellipsis;
  }

  .navigation-rail-copy span {
    color: var(--md-sys-color-on-surface);
    white-space: nowrap;
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

  .gallery-sidebar-heading strong {
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

  .lab-shell[data-gallery-density='compact'] .gallery-footer {
    gap: 0.6rem 1rem;
    padding: 0.75rem;
  }

  .lab-shell[data-gallery-density='compact'] .gallery-footer__mark {
    width: 1.75rem;
    height: 1.75rem;
  }

  .lab-shell[data-gallery-density='compact'] .gallery-footer__meta {
    padding-top: 0.5rem;
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

    .gallery-footer {
      grid-template-columns: minmax(0, 1fr);
    }

    .gallery-footer__links {
      justify-content: flex-start;
    }

    .gallery-footer__meta {
      grid-column: 1;
      flex-wrap: wrap;
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

  :global(:root[data-lds-device='phone']) .gallery-footer__links a {
    min-height: 2.75rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .gallery-footer__links a {
      transition: none;
    }
  }
</style>
