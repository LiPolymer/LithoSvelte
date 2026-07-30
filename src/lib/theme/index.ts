import { themeConfig, type ThemeConfig } from './config'
import {
    createMaterialThemeController,
    type MaterialThemeController,
} from './materialTheme'

let currentConfig: ThemeConfig = { ...themeConfig }
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
    currentConfig = { ...currentConfig, ...config }
    controller?.update(currentConfig)
}
