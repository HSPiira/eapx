// Define a constant for assignment selection fields
export const assignmentSelectFields = {
    id: true,
    serviceId: true,
    contractId: true,
    clientId: true,
    status: true,
    startDate: true,
    endDate: true,
    frequency: true,
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
    contract: {
        select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
        },
    },
    client: {
        select: {
            id: true,
            name: true,
        },
    },
} as const;