import { auth } from "@/middleware/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { withSecurityHeaders } from "@/middleware/security"
import { rateLimit } from "@/lib/rate-limit"
import { isPublicPath } from "@/config/auth"
import { apiLogger } from "@/lib/logger"

// Rate limit configuration for auth routes
const authRateLimit = {
    maxRequests: 5,       // 5 requests
    windowMs: 60 * 1000,  // per minute
}

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Rate limit auth requests
    if (pathname.startsWith("/auth") || pathname.startsWith("/api/auth")) {
        const ip = request.headers.get("x-forwarded-for") || "anonymous"
        const ua = request.headers.get("user-agent") || "unknown"
        const rateLimitResult = await rateLimit.check(ip, ua)

        if (!rateLimitResult.success) {
            apiLogger.rateLimit(ip, pathname);
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
    if (isPublicPath(pathname)) {
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
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
}