import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { Redis } from '@upstash/redis';

export interface CacheOptions {
    maxAge?: number;
    staleWhileRevalidate?: number;
    isPrivate?: boolean;
    ttl?: number; // Time to live in seconds
    tags?: string[]; // Cache tags for invalidation
    version?: string; // Cache version for invalidation
}

export interface CacheMetadata {
    version: string;
    tags: string[];
    createdAt: number;
    expiresAt: number;
}

export interface CacheValue<T> {
    data: T;
    metadata: CacheMetadata;
}

export class CacheError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'CacheError';
    }
}

export class CacheControl {
    static getHeaders(options: CacheOptions = {}) {
        const {
            maxAge = 10,
            staleWhileRevalidate = 59,
            isPrivate = false,
        } = options;

        return {
            'Cache-Control': [
                isPrivate ? 'private' : 'public',
                `max-age=${maxAge}`,
                `s-maxage=${maxAge}`,
                `stale-while-revalidate=${staleWhileRevalidate}`,
            ].join(', '),
        };
    }

    static generateETag<T>(data: T): string {
        const content = typeof data === 'string' ? data : JSON.stringify(data);
        return createHash('sha256').update(content).digest('base64');
    }

    static withCache<T>(
        response: NextResponse,
        data: T,
        options?: CacheOptions,
        extraHeaders: Record<string, string> = {}
    ): NextResponse {
        const etag = this.generateETag(data);
        const headers = this.getHeaders(options);

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                ...Object.fromEntries(response.headers),
                ...headers,
                'ETag': `"${etag}"`,
                ...extraHeaders,
            },
        });
    }

    static handleConditionalRequest<T>(
        request: NextRequest,
        data: T
    ): NextResponse | null {
        const etag = this.generateETag(data);
        const ifNoneMatch = request.headers.get('if-none-match');

        if (ifNoneMatch === `"${etag}"`) {
            return new NextResponse(null, { status: 304 });
        }

        return null;
    }
}

class Cache {
    private redis: Redis;
    private defaultTTL: number;
    private defaultVersion: string;
    private readonly TAG_PREFIX = 'tag:';
    private readonly VERSION_PREFIX = 'version:';

    constructor(defaultTTL = 3600, defaultVersion = '1') {
        this.redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        this.defaultTTL = defaultTTL;
        this.defaultVersion = defaultVersion;
    }

    private generateKey(key: string, version?: string): string {
        return version ? `${this.VERSION_PREFIX}${version}:${key}` : key;
    }

    private generateTagKey(tag: string): string {
        return `${this.TAG_PREFIX}${tag}`;
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const cacheKey = this.generateKey(key);
            const value = await this.redis.get<CacheValue<T>>(cacheKey);

            if (!value) return null;

            // Check if the value has expired
            if (value.metadata.expiresAt < Date.now()) {
                await this.delete(key);
                return null;
            }

            return value.data;
        } catch (error) {
            console.error('Cache get error:', error);
            throw new CacheError('Failed to get cache value', 'CACHE_GET_ERROR');
        }
    }

    async set<T>(
        key: string,
        value: T,
        options: CacheOptions = {}
    ): Promise<void> {
        try {
            const {
                ttl = this.defaultTTL,
                tags = [],
                version = this.defaultVersion,
            } = options;

            const cacheKey = this.generateKey(key, version);
            const expiresAt = Date.now() + (ttl * 1000);

            const cacheValue: CacheValue<T> = {
                data: value,
                metadata: {
                    version,
                    tags,
                    createdAt: Date.now(),
                    expiresAt,
                },
            };

            // Store the cache value
            await this.redis.set(cacheKey, cacheValue, { ex: ttl });

            // Store tag associations
            if (tags.length > 0) {
                const tagKeys = tags.map(tag => this.generateTagKey(tag));
                await Promise.all(
                    tagKeys.map(tagKey =>
                        this.redis.sadd(tagKey, cacheKey)
                    )
                );
            }
        } catch (error) {
            console.error('Cache set error:', error);
            throw new CacheError('Failed to set cache value', 'CACHE_SET_ERROR');
        }
    }

    async delete(key: string, version: string = this.defaultVersion): Promise<void> {
        try {
            const cacheKey = this.generateKey(key, version);
            await this.redis.del(cacheKey);
        } catch (error) {
            console.error('Cache delete error:', error);
            throw new CacheError('Failed to delete cache value', 'CACHE_DELETE_ERROR');
        }
    }

    async invalidateByTags(tags: string[], version: string = this.defaultVersion): Promise<void> {
        try {
            const tagKeys = tags.map(tag => this.generateTagKey(tag));
            const keysToDelete = await Promise.all(
                tagKeys.map(tagKey => this.redis.smembers(tagKey))
            );

            // Flatten and deduplicate keys
            const uniqueKeys = [...new Set(keysToDelete.flat())];

            if (uniqueKeys.length > 0) {
                // Delete all keys with the specified version
                const versionedKeys = uniqueKeys.filter(key => key.startsWith(`${this.VERSION_PREFIX}${version}:`));
                if (versionedKeys.length > 0) {
                    await this.redis.del(...versionedKeys);
                }
                // Clean up tag sets
                await this.redis.del(...tagKeys);
            }
        } catch (error) {
            console.error('Cache tag invalidation error:', error);
            throw new CacheError('Failed to invalidate cache by tags', 'CACHE_TAG_INVALIDATION_ERROR');
        }
    }

    async invalidateByVersion(version: string): Promise<void> {
        try {
            const pattern = `${this.VERSION_PREFIX}${version}:*`;
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            console.error('Cache version invalidation error:', error);
            throw new CacheError('Failed to invalidate cache by version', 'CACHE_VERSION_INVALIDATION_ERROR');
        }
    }

    async clear(): Promise<void> {
        try {
            const keys = await this.redis.keys('*');
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            console.error('Cache clear error:', error);
            throw new CacheError('Failed to clear cache', 'CACHE_CLEAR_ERROR');
        }
    }

    async deleteByPrefix(prefix: string, version: string = this.defaultVersion): Promise<void> {
        try {
            const pattern = `${this.generateKey(prefix, version)}*`;
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            console.error('Cache prefix deletion error:', error);
            throw new CacheError('Failed to delete cache by prefix', 'CACHE_PREFIX_DELETE_ERROR');
        }
    }

    async getStats(): Promise<{
        totalKeys: number;
        totalTags: number;
        memoryUsage: number;
    }> {
        try {
            const keys = await this.redis.keys('*');
            const tagKeys = keys.filter(key => key.startsWith(this.TAG_PREFIX));

            // For now, we'll just return the key counts
            // Memory usage tracking would require Redis Enterprise features
            return {
                totalKeys: keys.length - tagKeys.length,
                totalTags: tagKeys.length,
                memoryUsage: 0, // Memory usage tracking not available in basic Redis
            };
        } catch (error) {
            console.error('Cache stats error:', error);
            throw new CacheError('Failed to get cache stats', 'CACHE_STATS_ERROR');
        }
    }
}

export const cache = new Cache();