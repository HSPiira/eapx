import { z } from "zod";

export const InterventionSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    serviceId: z.string(),
    service: z.object({
        id: z.string(),
        name: z.string(),
    }),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED', 'DELETED']),
    duration: z.number().nullable(),
    capacity: z.number().nullable(),
    prerequisites: z.string().nullable(),
    isPublic: z.boolean(),
    price: z.number().nullable(),
    metadata: z.record(z.unknown()),
    deletedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    serviceProviderId: z.string().nullable(),
    ServiceProvider: z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
    }).nullable().optional(),
});

// Schema for creating an intervention (no id because it's generated)
const CreateInterventionInputSchema = InterventionSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    service: true,
    ServiceProvider: true,
});

// Schema for updating an intervention (requires id)
export const UpdateInterventionInputSchema = InterventionSchema.pick({
    id: true,
}).extend(
    CreateInterventionInputSchema.shape // all other fields except id
);

export type Intervention = z.infer<typeof InterventionSchema>;
export type CreateInterventionInput = z.infer<typeof CreateInterventionInputSchema>;
export type UpdateInterventionInput = z.infer<typeof UpdateInterventionInputSchema>;

