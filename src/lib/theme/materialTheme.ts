import {
    applyTheme,
    argbFromHex,
    themeFromSourceColor,
} from '@material/material-color-utilities'

import type { ThemeConfig } from './config'

const darkQuery = '(prefers-color-scheme: dark)'

export function installMaterialTheme(config: ThemeConfig): () => void {
    const root = document.documentElement
    const media = window.matchMedia(darkQuery)
    const theme = themeFromSourceColor(argbFromHex(config.seed))

    const apply = () => {
        const dark =
            config.mode === 'system'
                ? media.matches
                : config.mode === 'dark'

        applyTheme(theme, { target: root, dark })

        root.dataset.theme = dark ? 'dark' : 'light'
        root.style.colorScheme = dark ? 'dark' : 'light'
    }

    apply()

    if (config.mode === 'system') {
        media.addEventListener('change', apply)
    }

    return () => media.removeEventListener('change', apply)
}