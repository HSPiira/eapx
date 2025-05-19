import { NextApiRequest } from "next";

interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
    search?: string | null;
    status?: string | null;
}

export function getPaginationParams(req: NextApiRequest | URLSearchParams): PaginationParams {
    const params = req instanceof URLSearchParams ? req : new URLSearchParams(req.query as Record<string, string>);

    const page = Math.max(1, parseInt(params.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') || '10')));
    const offset = (page - 1) * limit;
    const search = params.get('search');
    const status = params.get('status');

    return { page, limit, offset, search, status };
}