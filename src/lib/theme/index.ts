import { themeConfig } from './config'
import { installMaterialTheme } from './materialTheme'

export function installTheme() {
    return installMaterialTheme(themeConfig)
}