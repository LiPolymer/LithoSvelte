export type ThemeMode = 'system' | 'light' | 'dark'

export interface ThemeConfig {
    seed: `#${string}`
    mode: ThemeMode
}

export const themeConfig = {
    seed: '#6e83ad',
    mode: 'system',
} satisfies ThemeConfig