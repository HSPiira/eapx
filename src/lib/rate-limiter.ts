import { Redis } from '@upstash/redis';

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private redis: Redis;
    private windowMs: number;
    private maxRequests: number;

    constructor(windowMs = 60 * 1000, maxRequests = 100) { // Default: 100 requests per minute
        this.redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }

    async isAllowed(ip: string): Promise<boolean> {
        const now = Date.now();
        const key = `ratelimit:${ip}`;

        try {
            // Get current rate limit data
            const data = await this.redis.get<RateLimitEntry>(key);

            if (!data) {
                // First request from this IP
                await this.redis.set(key, {
                    count: 1,
                    resetTime: now + this.windowMs
                }, {
                    ex: Math.ceil(this.windowMs / 1000) // Convert to seconds for Redis
                });
                return true;
            }

            if (now > data.resetTime) {
                // Reset window
                await this.redis.set(key, {
                    count: 1,
                    resetTime: now + this.windowMs
                }, {
                    ex: Math.ceil(this.windowMs / 1000)
                });
                return true;
            }

            if (data.count >= this.maxRequests) {
                return false;
            }

            // Increment counter
            await this.redis.set(key, {
                count: data.count + 1,
                resetTime: data.resetTime
            }, {
                ex: Math.ceil((data.resetTime - now) / 1000)
            });

            return true;
        } catch (error) {
            console.error('Rate limiter Redis error:', error);
            // Fail open - allow request if Redis is down
            return true;
        }
    }

    async reset(ip: string): Promise<void> {
        try {
            await this.redis.del(`ratelimit:${ip}`);
        } catch (error) {
            console.error('Rate limiter reset error:', error);
        }
    }
}

export const rateLimiter = new RateLimiter(); 