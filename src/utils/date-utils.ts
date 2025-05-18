export function toISO(date?: Date | null): string | null {
    return date ? date.toISOString() : null;
}

export function toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return typeof value === "string" ? new Date(value) : value;
}
