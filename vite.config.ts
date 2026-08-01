import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

const deploymentBase = process.env.GITHUB_PAGES_BASE_PATH ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base: deploymentBase,
  plugins: [svelte(), tailwindcss()],
  build: {
    // `dist` belongs to the installable component package produced by
    // svelte-package. Keep the Gallery build independent from it.
    outDir: 'site-dist',
  },
})
