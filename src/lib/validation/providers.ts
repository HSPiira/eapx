import { z } from 'zod';

// Enums matching Prisma schema
export const ServiceProviderTypeEnum = z.enum(["COUNSELOR", "CLINIC", "HOTLINE", "COACH", "OTHER"]);
export const ProviderEntityTypeEnum = z.enum(["INDIVIDUAL", "COMPANY"]);

// PATCH: all fields optional
export const providerUpdateSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    type: ServiceProviderTypeEnum.optional().nullable(),
    entityType: ProviderEntityTypeEnum.optional(),
    contactEmail: z.string().email("Must be a valid email").optional(),
    contactPhone: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    qualifications: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
    isVerified: z.boolean().optional(),
    status: z.string().optional(),
    rating: z.number().optional().nullable(),
    metadata: z.record(z.unknown()).optional().nullable(),
}); 