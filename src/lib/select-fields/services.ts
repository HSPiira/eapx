export const serviceSelectFields = {
    id: true,
    name: true,
    description: true,
    categoryId: true,
    status: true,
    duration: true,
    capacity: true,
    prerequisites: true,
    isPublic: true,
    price: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
    category: {
        select: {
            id: true,
            name: true,
        },
    },
    ServiceProvider: {
        select: {
            id: true,
            name: true,
            type: true,
        },
    },
} as const;