import { Redis } from '@upstash/redis';

class RateLimiter {
    private redis: Redis;
    private windowMs: number;
    private maxRequests: number;

    constructor(windowMs = 60 * 1000, maxRequests = 100) { // Default: 100 requests per minute
        const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = process.env;
        if (!url || !token) {
            throw new Error('RateLimiter: Upstash Redis env variables are not set');
        }
        this.redis = new Redis({ url, token });
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }

    async isAllowed(ip: string): Promise<boolean> {
        const now = Date.now();
        const key = `ratelimit:${ip}:${Math.floor(now / this.windowMs)}`;

        try {
            // Use INCR for atomic increment
            const count = await this.redis.incr(key);

            // Set expiry on first request
            if (count === 1) {
                await this.redis.expire(key, Math.ceil(this.windowMs / 1000));
            }

            return count <= this.maxRequests;
        } catch (error) {
            console.error('Rate limiter Redis error:', error);
            // Fail open - allow request if Redis is down
            return true;
        }
    }

    async reset(ip: string): Promise<void> {
        try {
            const pattern = `ratelimit:${ip}:*`;
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            console.error('Rate limiter reset error:', error);
        }
    }
}

export const rateLimiter = new RateLimiter(); 