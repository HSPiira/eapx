// Define a constant for session selection fields
export const sessionSelectFields = {
    id: true,
    serviceId: true,
    providerId: true,
    beneficiaryId: true,
    scheduledAt: true,
    completedAt: true,
    status: true,
    notes: true,
    feedback: true,
    duration: true,
    location: true,
    cancellationReason: true,
    rescheduleCount: true,
    isGroupSession: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
    service: {
        select: {
            id: true,
            name: true,
            description: true,
        },
    },
    provider: {
        select: {
            id: true,
            name: true,
            type: true,
        },
    },
    beneficiary: {
        select: {
            id: true,
            profile: {
                select: {
                    fullName: true,
                },
            },
        },
    },
    staff: {
        select: {
            id: true,
            profile: {
                select: {
                    fullName: true,
                },
            },
        },
    },
} as const;