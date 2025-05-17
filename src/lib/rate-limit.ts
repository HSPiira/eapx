import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
})

export const rateLimit = {
    check: async (identifier: string = "anonymous", ip: string = "127.0.0.1") => {
        try {
            // Use identifier + ip to differentiate users or devices
            const key = `${identifier}:${ip}`
            const { success, limit, remaining, reset } = await ratelimit.limit(key)

            // Optionally: log or handle metadata (limit, remaining, reset) for monitoring

            return { success, limit, remaining, reset }
        } catch (error) {
            console.error("RateLimit error:", error)
            // Fail open (allow request) on error or decide to block all requests
            return { success: true }
        }
    },
}
