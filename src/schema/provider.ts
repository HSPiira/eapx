import { z } from "zod";
import { ServiceProviderType, ProviderEntityType, WorkStatus } from "./enums";

// Base schema for ServiceProvider
export const ServiceProviderSchema = z.object({
    id: z.string().cuid(),
    name: z.string().min(1, "Name is required"),
    type: ServiceProviderType.optional(),
    contactEmail: z.string().email("Invalid email address"),
    contactPhone: z.string().optional(),
    location: z.string().optional(),
    entityType: ProviderEntityType.default("INDIVIDUAL"),
    qualifications: z.array(z.string()),
    specializations: z.array(z.string()),
    rating: z.number().min(0).max(5).optional(),
    isVerified: z.boolean().default(false),
    metadata: z.record(z.unknown()).optional(),
    status: WorkStatus.default("ACTIVE"),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
});

// Input schema for creating a new ServiceProvider
export const CreateServiceProviderInput = ServiceProviderSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
});

// Input schema for updating an existing ServiceProvider
export const UpdateServiceProviderInput = ServiceProviderSchema.pick({
    id: true,
}).extend(
    CreateServiceProviderInput.shape
);

// Type exports
export type ServiceProvider = z.infer<typeof ServiceProviderSchema>;
export type CreateServiceProviderInput = z.infer<typeof CreateServiceProviderInput>;
export type UpdateServiceProviderInput = z.infer<typeof UpdateServiceProviderInput>;
export type ServiceProviderType = z.infer<typeof ServiceProviderType>;
export type ProviderEntityType = z.infer<typeof ProviderEntityType>;
export type WorkStatus = z.infer<typeof WorkStatus>;
