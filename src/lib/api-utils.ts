interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
    search?: string | null;
    status?: string | null;
}

export function getPaginationParams(request: Request): PaginationParams {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    return {
        page,
        limit,
        offset,
        search,
        status
    };
} 