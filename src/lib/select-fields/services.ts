export const serviceSelectFields = {
    id: true,
    name: true,
    description: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
    interventions: {
        select: {
            id: true,
            name: true,
            description: true,
            status: true,
            duration: true,
            capacity: true,
            isPublic: true,
            price: true,
        },
    },
};