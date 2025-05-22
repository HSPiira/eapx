export const providerSelectFields = {
    id: true,
    name: true,
    type: true,
    contactEmail: true,
    contactPhone: true,
    location: true,
    qualifications: true,
    specializations: true,
    availability: true,
    rating: true,
    isVerified: true,
    status: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
    _count: {
        select: {
            services: true,
            sessions: true,
        },
    },
} as const;

export const providerWithRelationsSelectFields = {
    ...providerSelectFields,
    services: {
        select: {
            id: true,
            name: true,
            description: true,
            status: true,
            isPublic: true,
        },
    },
    sessions: {
        select: {
            id: true,
            scheduledAt: true,
            status: true,
            duration: true,
        },
        orderBy: {
            scheduledAt: 'desc',
        },
        take: 10,
    },
} as const;