export function nullableFilter<T>(key: string, value: T | undefined): Record<string, T> {
    return value !== undefined ? { [key]: value } : {};
}

export function rangeFilter<T>(
    key: string,
    min?: T,
    max?: T
): Record<string, { gte?: T; lte?: T }> {
    if (!min && !max) return {};
    return {
        [key]: {
            ...(min ? { gte: min } : {}),
            ...(max ? { lte: max } : {})
        }
    };
}
