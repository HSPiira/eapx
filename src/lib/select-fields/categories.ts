export const categorySelectFields = {
    id: true,
    name: true,
    description: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
    _count: {
        select: {
            services: true,
        },
    },
} as const;

// Define a constant for category with services selection fields
export const categoryWithServicesSelectFields = {
    ...categorySelectFields,
    services: {
        select: {
            id: true,
            name: true,
            description: true,
            status: true,
            isPublic: true,
        },
    },
} as const;