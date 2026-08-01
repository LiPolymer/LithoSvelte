import {
    isThemeMode,
    normalizeThemeSeed,
    readThemeConfigCookie,
    themeConfig,
    writeThemeConfigCookie,
    type ThemeConfig,
} from './config'
import {
    createMaterialThemeController,
    type MaterialThemeController,
} from './materialTheme'

let currentConfig: ThemeConfig = readThemeConfigCookie()
let controller: MaterialThemeController | undefined

export function installTheme() {
    const installedController = createMaterialThemeController(currentConfig)
    controller = installedController

    return () => {
        installedController.dispose()

        if (controller === installedController) {
            controller = undefined
        }
    }
}

export function getThemeConfig(): ThemeConfig {
    return { ...currentConfig }
}

export function updateTheme(config: Partial<ThemeConfig>): void {
    const seed = config.seed === undefined
        ? currentConfig.seed
        : normalizeThemeSeed(config.seed) ?? currentConfig.seed
    const mode = config.mode === undefined
        ? currentConfig.mode
        : isThemeMode(config.mode)
            ? config.mode
            : currentConfig.mode

    currentConfig = { seed, mode }
    writeThemeConfigCookie(currentConfig)
    controller?.update(currentConfig)
}
