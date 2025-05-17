import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function withSecurityHeaders(request: NextRequest, response: NextResponse) {
    // Security headers following OWASP recommendations
    const securityHeaders = {
        'X-DNS-Prefetch-Control': 'on',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-Permitted-Cross-Domain-Policies': 'none',
        'X-XSS-Protection': '0', // CSP should be used instead
        'Content-Security-Policy': constructCSP(),
        'Permissions-Policy': constructPermissionsPolicy(),
    }

    // Apply security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
    })

    return response
}

function constructCSP() {
    const directives = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for Next.js
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'"],
        'connect-src': ["'self'"],
        'media-src': ["'self'"],
        'object-src': ["'none'"],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-src': ["'self'"],
        'upgrade-insecure-requests': [],
    }

    return Object.entries(directives)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ')
}

function constructPermissionsPolicy() {
    const permissions = {
        accelerometer: '()',
        'ambient-light-sensor': '()',
        autoplay: '()',
        battery: '()',
        camera: '()',
        'display-capture': '()',
        'document-domain': '()',
        'encrypted-media': '()',
        fullscreen: '()',
        geolocation: '()',
        gyroscope: '()',
        magnetometer: '()',
        microphone: '()',
        midi: '()',
        payment: '()',
        'picture-in-picture': '()',
        'publickey-credentials-get': '()',
        'screen-wake-lock': '()',
        'sync-xhr': '()',
        usb: '()',
        'web-share': '()',
        'xr-spatial-tracking': '()',
    }

    return Object.entries(permissions)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ')
}