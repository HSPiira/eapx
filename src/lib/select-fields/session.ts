// Define a constant for session selection fields
export const sessionSelectFields = {
    id: true,
    interventionId: true,
    providerId: true,
    providerStaffId: true,
    beneficiaryId: true,
    clientId: true,
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
    sessionType: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
    client: {
        select: {
            id: true,
            name: true,
        },
    },
    intervention: {
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
            entityType: true,
        },
    },
    providerStaff: {
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
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