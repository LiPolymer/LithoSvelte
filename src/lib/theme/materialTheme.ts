import {
    applyTheme,
    argbFromHex,
    themeFromSourceColor,
} from '@material/material-color-utilities'

import type { ThemeConfig } from './config'

const darkQuery = '(prefers-color-scheme: dark)'

export interface MaterialThemeController {
    update(config: ThemeConfig): void
    dispose(): void
}

export function createMaterialThemeController(
    initialConfig: ThemeConfig,
): MaterialThemeController {
    const root = document.documentElement
    const media = window.matchMedia(darkQuery)
    let config = { ...initialConfig }
    let theme = themeFromSourceColor(argbFromHex(config.seed))

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
    media.addEventListener('change', apply)

    return {
        update(nextConfig) {
            if (nextConfig.seed !== config.seed) {
                theme = themeFromSourceColor(argbFromHex(nextConfig.seed))
            }

            config = { ...nextConfig }
            apply()
        },
        dispose() {
            media.removeEventListener('change', apply)
        },
    }
}

export function installMaterialTheme(config: ThemeConfig): () => void {
    const controller = createMaterialThemeController(config)
    return () => controller.dispose()
}
