export function buildOrderBy<T>(
    field: keyof T | undefined,
    direction: 'asc' | 'desc' | undefined,
    fallback: { field: keyof T; direction: 'asc' | 'desc' }
): Record<string, 'asc' | 'desc'> {
    return field ? { [field]: direction || 'asc' } : { [fallback.field]: fallback.direction };
}
