import { z } from "zod";

export const ClientSchema = z.object({
    id: z.string().cuid(),
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    website: z.string().nullable(),
    address: z.string().nullable(),
    billingAddress: z.string().nullable(),
    taxId: z.string().nullable(),
    contactPerson: z.string().nullable(),
    contactEmail: z.string().nullable(),
    contactPhone: z.string().nullable(),
    industryId: z.string().cuid().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED', 'DELETED']),
    preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'SMS', 'WHATSAPP', 'OTHER']).nullable(),
    timezone: z.string().nullable(),
    isVerified: z.boolean(),
    notes: z.string().nullable(),
    metadata: z.record(z.unknown()).nullable(),
    deletedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

// Schema for creating a client (no id because it's generated)
const CreateClientInputSchema = ClientSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
});

// Schema for updating a client (requires id)
export const UpdateClientInputSchema = ClientSchema.pick({
    id: true,
}).extend(
    CreateClientInputSchema.shape // all other fields except id
);

export type Client = z.infer<typeof ClientSchema>;
export type CreateClientInput = z.infer<typeof CreateClientInputSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientInputSchema>;
