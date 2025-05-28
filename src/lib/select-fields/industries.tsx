export const industrySelectFields = {
    id: true,
    name: true,
    code: true,
    description: true,
    parentId: true,
    externalId: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
    parent: {
        select: {
            id: true,
            name: true,
            code: true
        }
    },
    children: {
        select: {
            id: true,
            name: true,
            code: true
        }
    }
} as const;