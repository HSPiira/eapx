export const clientSelectFields = {
    id: true,
    name: true,
    email: true,
    phone: true,
    website: true,
    address: true,
    billingAddress: true,
    taxId: true,
    contactPerson: true,
    contactEmail: true,
    contactPhone: true,
    industryId: true,
    industry: {
        select: {
            id: true,
            name: true,
            code: true
        }
    },
    status: true,
    preferredContactMethod: true,
    timezone: true,
    isVerified: true,
    notes: true,
    metadata: true,
    createdAt: true,
    updatedAt: true
} as const;