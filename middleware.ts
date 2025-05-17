import { auth } from "@/middleware/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { withSecurityHeaders } from "@/middleware/security"
import { rateLimit } from "@/lib/rate-limit"

// Rate limit configuration for auth routes
const authRateLimit = {
    maxRequests: 5,       // 5 requests
    windowMs: 60 * 1000,  // per minute
}

// List of paths that should be considered public (no auth required)
const publicPaths = [
    "/",
    "/auth/login",
    "/auth/error",
    "/favicon.ico",
    "/logo.svg",
    "/logo.png",
    "/globe.svg",
    "/window.svg",
    "/file.svg",
    "/microsoft.svg"
]

// Helper to determine if a path is public
function isPublicPath(pathname: string): boolean {
    return publicPaths.some(path =>
        pathname === path || pathname.startsWith(path + "/")
    )
}

// Helper to check if it's a static asset (e.g., public/* or _next/static/*)
function isStaticAsset(pathname: string): boolean {
    return pathname.startsWith("/_next/static") ||
        pathname.startsWith("/_next/image") ||
        pathname.startsWith("/static") ||     // your custom public assets
        pathname.endsWith(".svg") ||
        pathname.endsWith(".ico")
}

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Rate limit auth requests
    if (pathname.startsWith("/auth") || pathname.startsWith("/api/auth")) {
        const ip = request.headers.get("x-forwarded-for") || "anonymous"
        const ua = request.headers.get("user-agent") || "unknown"
        const rateLimitResult = await rateLimit.check(ip, ua)

        if (!rateLimitResult.success) {
            console.warn("Rate limit exceeded:", { ip, ua })
            return new NextResponse(
                JSON.stringify({ error: "Too Many Requests" }),
                {
                    status: 429,
                    headers: { "Content-Type": "application/json" }
                }
            )
        }
    }

    // 2. Allow all public or static asset requests through
    if (isPublicPath(pathname) || isStaticAsset(pathname)) {
        return withSecurityHeaders(request, NextResponse.next())
    }

    // 3. Check session
    const session = await auth()

    // 4. Redirect unauthenticated users from protected pages
    if (!session) {
        const signInUrl = new URL("/auth/login", request.url)
        signInUrl.searchParams.set("callbackUrl", request.url)
        return NextResponse.redirect(signInUrl)
    }

    // 5. Redirect authenticated users away from the login page
    if (session && pathname === "/auth/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // 6. Allow the request and apply security headers
    return withSecurityHeaders(request, NextResponse.next())
}

// Apply middleware to all routes except those we explicitly exclude
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}