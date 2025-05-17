import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

export interface CacheOptions {
    maxAge?: number;
    staleWhileRevalidate?: number;
    isPrivate?: boolean;
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

        // Clone the response to add headers
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

    // Optional helper to handle conditional requests
    static handleConditionalRequest<T>(
        request: NextRequest,
        data: T
    ): NextResponse | null {
        const etag = this.generateETag(data);
        const ifNoneMatch = request.headers.get('if-none-match');

        if (ifNoneMatch === `"${etag}"`) {
            // Return 304 Not Modified if ETag matches
            return new NextResponse(null, { status: 304 });
        }

        return null;
    }
}