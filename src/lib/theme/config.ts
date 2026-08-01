export type ThemeMode = 'system' | 'light' | 'dark'

export interface ThemeConfig {
    seed: `#${string}`
    mode: ThemeMode
}

export const themeConfig = {
    seed: '#a4e12a',
    mode: 'system',
} satisfies ThemeConfig

const themeCookieName = 'litho-theme'
const themeCookieMaxAge = 60 * 60 * 24 * 365
const themeSeedPattern = /^#?([0-9a-f]{6})$/i

export function normalizeThemeSeed(
    value: unknown,
): `#${string}` | undefined {
    if (typeof value !== 'string') return undefined

    const match = value.trim().match(themeSeedPattern)
    return match ? `#${match[1].toLowerCase()}` : undefined
}

export function isThemeMode(value: unknown): value is ThemeMode {
    return value === 'system' || value === 'light' || value === 'dark'
}

function readCookieValue(cookieSource: string, name: string) {
    const prefix = `${name}=`
    const entry = cookieSource
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(prefix))

    return entry?.slice(prefix.length)
}

export function readThemeConfigCookie(
    cookieSource = typeof document === 'undefined' ? '' : document.cookie,
): ThemeConfig {
    const encodedValue = readCookieValue(cookieSource, themeCookieName)
    if (!encodedValue) return { ...themeConfig }

    try {
        const stored = JSON.parse(decodeURIComponent(encodedValue)) as {
            seed?: unknown
            mode?: unknown
        }

        return {
            seed: normalizeThemeSeed(stored.seed) ?? themeConfig.seed,
            mode: isThemeMode(stored.mode) ? stored.mode : themeConfig.mode,
        }
    } catch {
        return { ...themeConfig }
    }
}

export function writeThemeConfigCookie(config: ThemeConfig): void {
    if (typeof document === 'undefined') return

    const value = encodeURIComponent(JSON.stringify(config))
    const secure = location.protocol === 'https:' ? '; Secure' : ''

    document.cookie = [
        `${themeCookieName}=${value}`,
        'Path=/',
        `Max-Age=${themeCookieMaxAge}`,
        'SameSite=Lax',
    ].join('; ') + secure
}
