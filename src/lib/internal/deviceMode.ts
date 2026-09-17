const deviceAttribute = 'data-lds-device'

const tabletUserAgentPattern =
    /(?:iPad|Tablet|PlayBook|Silk|Kindle)/i
const androidUserAgentPattern = /Android/i
const androidMobileUserAgentPattern = /Android.*Mobile/i
const phoneUserAgentPattern =
    /(?:iPhone|Windows Phone|IEMobile|BlackBerry|BB10|Opera Mini|Opera Mobi|webOS.*Mobile|hpwOS.*Mobile|KaiOS)/i

export function isPhoneUserAgent(userAgent: string): boolean {
    if (!userAgent || tabletUserAgentPattern.test(userAgent)) return false
    if (phoneUserAgentPattern.test(userAgent)) return true

    if (androidUserAgentPattern.test(userAgent)) {
        return androidMobileUserAgentPattern.test(userAgent)
    }

    return false
}

export function installPhoneDeviceMode(
    root = document.documentElement,
    userAgent = navigator.userAgent,
): () => void {
    const previousValue = root.getAttribute(deviceAttribute)

    if (isPhoneUserAgent(userAgent)) {
        root.setAttribute(deviceAttribute, 'phone')
    } else {
        root.removeAttribute(deviceAttribute)
    }

    return () => {
        if (previousValue === null) {
            root.removeAttribute(deviceAttribute)
        } else {
            root.setAttribute(deviceAttribute, previousValue)
        }
    }
}
