import { z } from "zod";

// Base schema for Service
export const ServiceSchema = z.object({
    id: z.string().cuid(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
});

// Input schema for creating a new Service
export const CreateServiceInput = ServiceSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
});

// Input schema for updating an existing Service
export const UpdateServiceInput = CreateServiceInput.partial();

// Type exports
export type Service = z.infer<typeof ServiceSchema>;
export type CreateServiceInput = z.infer<typeof CreateServiceInput>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceInput>;
