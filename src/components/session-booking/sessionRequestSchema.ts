import * as z from 'zod';

// Centralized session types and methods
export const SESSION_METHODS = ['online', 'physical', 'phone', 'virtual'] as const;
export const SESSION_TYPES = [
    'individual', 'group', 'couple', // classic
    'talk', 'comedy', 'training'     // company
] as const;

export type SessionMethod = typeof SESSION_METHODS[number];
export type SessionType = typeof SESSION_TYPES[number];

// Shared interfaces
export interface Company {
    id: string;
    name: string;
}

export interface Staff {
    id: string;
    name: string;
    email: string;
    companyId: string;
}

export interface ServiceProvider {
    id: string;
    name: string;
    email: string;
    type: string;
    serviceProvider?: { entityType?: string };
    entityType?: string;
}

export interface Beneficiary {
    id: string;
    name: string;
    relation: string;
}

export interface Intervention {
    id: string;
    name: string;
    duration: number;
    capacity: number;
}

// Centralized default values
export const SESSION_REQUEST_DEFAULTS: Partial<SessionRequestFormData> = {
    isGroupSession: false,
    duration: 60,
};

// Centralized duration options
export const DURATION_OPTIONS = [
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
];

// Utility function for formatting time slots
export function formatTimeSlot(time: string, format: '12' | '24') {
    if (format === '24') return time;
    // Convert 'HH:mm' to 12-hour format
    const [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

// Zod schema with refinements for conditional requirements
export const sessionRequestSchema = z.object({
    companyId: z.string().min(1, 'Company is required'),
    staffId: z.string().optional(), // Only required for staff sessions
    counselorId: z.string().min(1, 'Counselor is required'),
    interventionId: z.string().min(1, 'Intervention is required'),
    beneficiaryId: z.string().optional(),
    providerStaffId: z.string().optional(),
    sessionType: z.string().min(1, 'Session type is required'),
    sessionMethod: z.enum(SESSION_METHODS, {
        required_error: 'Session method is required',
    }),
    date: z.date({
        required_error: 'Date is required',
    }),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    location: z.string().optional(),
    duration: z.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration cannot exceed 4 hours'),
    isGroupSession: z.boolean().default(false),
    notes: z.string().optional(),
    metadata: z.object({
        requestMethod: z.string().optional(),
        requestNotes: z.string().optional(),
        groupSize: z.number().optional(),
        specialRequirements: z.string().optional(),
    }).optional(),
}).refine(
    (data) => {
        // staffId is required only if sessionFor is 'staff' (assume sessionFor is passed in metadata for validation)
        if (data.metadata && (data.metadata as { sessionFor: string }).sessionFor === 'staff') {
            return !!data.staffId;
        }
        return true;
    },
    {
        message: 'Staff member is required for staff sessions',
        path: ['staffId'],
    }
);

export type SessionRequestFormData = z.infer<typeof sessionRequestSchema>; 