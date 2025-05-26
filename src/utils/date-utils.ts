export function toISO(date?: Date | null): string | null {
    return date ? date.toISOString() : null;
}

export function toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return typeof value === "string" ? new Date(value) : value;
}

export function formatTimeSlot(time: string, format: '12' | '24') {
    if (format === '24') return time;
    // Convert 'HH:mm' to 12-hour format
    const [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}