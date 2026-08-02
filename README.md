# Litho

Litho is a compact Svelte 5 design system for productivity interfaces. It uses
Material Color Utilities for the dynamic color foundation and Tailwind CSS 4
for its shared design tokens.

The repository contains two separate build targets:

- `dist/` is the installable component package.
- `site-dist/` is the Control Gallery application.

## Install from Git

Git installations build `dist/` on the fly through the `prepare` script, so no
prebuilt artifacts are committed. Pin a version tag instead of a moving branch:

```sh
# GitLab
pnpm add litho@gitlab:LiPolymer/LithoSvelte#v0.1.0

# GitHub
pnpm add litho@github:LiPolymer/LithoSvelte#v0.1.0
```

The repository must stay public (or the consumer CI needs read credentials)
because the package manager clones it during installation. The lockfile pins
the exact commit, so `pnpm install --frozen-lockfile` stays reproducible.
Consumer CI that runs `--ignore-scripts` will skip the build and break this
workflow; use a registry package in that environment.

## Use it from another local project

Litho is still private and pre-release, so for local development the simplest
workflow is a file dependency.

First build the package in this repository:

```sh
pnpm run package
```

Then install it from the consuming project (adjust the path as needed):

```sh
pnpm add ../Litho
pnpm add -D tailwindcss @tailwindcss/vite
```

The consumer needs Svelte 5 and Tailwind CSS 4. Configure the Tailwind Vite
plugin in its `vite.config.ts`:

```ts
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
})
```

Import Tailwind and Litho's stable stylesheet entry once in the application's
global CSS:

```css
@import "tailwindcss";
@import "litho/styles.css";
```

Litho intentionally does not ship or select an application font. Add the
product's own font imports and `font-family` after these imports.

Install the dynamic Material theme before mounting the application:

```ts
import { installTheme } from 'litho'
import './app.css'

const disposeTheme = installTheme()

if (import.meta.hot) {
  import.meta.hot.dispose(disposeTheme)
}
```

The controller reads the saved seed color and theme mode before applying the
runtime tokens. It also writes changes made through `updateTheme` or
`ThemeSeedPicker` back to the theme cookie. `materialTokens.css` remains the
first-paint and IDE fallback.

Components and their public TypeScript types come from the root entry:

```svelte
<script lang="ts">
  import { PrimaryButton, Tag, TextField } from 'litho'

  let query = $state('')
</script>

<TextField label="Search" bind:value={query} />
<PrimaryButton>Run</PrimaryButton>
<Tag
  icon="information-o"
  removeLabel="Remove Local tag"
  onremove={() => {}}
>
  Local
</Tag>
```

For active library development, run `pnpm run package:watch` in Litho and keep
the consumer's Vite dev server running. Re-run the install if the package
manager copied the local dependency instead of linking it.

## Repository commands

```sh
pnpm run dev            # Control Gallery dev server
pnpm run check          # Svelte and TypeScript diagnostics
pnpm run package        # Build the installable library into dist/
pnpm run package:watch  # Rebuild dist/ while developing locally
pnpm run build:gallery  # Build only the Gallery into site-dist/
pnpm run build          # Build both package and Gallery
```

## GitHub Pages

`.github/workflows/deploy-pages.yml` checks and builds the Control Gallery on
each push to `prototype`, then deploys `site-dist/` with GitHub's Pages actions.
The workflow reads the configured Pages base path before building, so project
sites, account root sites, and custom domains share the same Vite config.

In the GitHub repository, open **Settings → Pages** and select **GitHub
Actions** as the publishing source. The workflow can also be started manually
from the Actions tab.

Before publishing to a registry, choose the final package name, version, and
license, then remove `private: true` from `package.json`.
