// Define a constant for feedback selection fields
export const feedbackSelectFields = {
    id: true,
    sessionId: true,
    rating: true,
    comment: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
    session: {
        select: {
            id: true,
            scheduledAt: true,
            completedAt: true,
            status: true,
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
        },
    },
} as const;