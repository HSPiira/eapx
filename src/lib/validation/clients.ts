import { z } from 'zod';
import { BaseStatus, ContactMethod } from '@prisma/client';

// Create Zod enums from Prisma enums
const baseStatusEnum = z.enum(Object.values(BaseStatus) as [string, ...string[]]);
const contactMethodEnum = z.enum(Object.values(ContactMethod) as [string, ...string[]]);

// Validation schema for client creation/update
export const clientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email').optional().nullable(),
    phone: z.string().optional().nullable(),
    website: z.string().url('Invalid website URL').optional().nullable(),
    address: z.string().optional().nullable(),
    billingAddress: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
    contactPerson: z.string().optional().nullable(),
    contactEmail: z.string().email('Invalid contact email').optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    industryId: z.string().optional().nullable(),
    status: baseStatusEnum.optional(),
    preferredContactMethod: contactMethodEnum.optional().nullable(),
    timezone: z.string().optional().nullable(),
    isVerified: z.boolean().optional(),
    notes: z.string().optional().nullable(),
    metadata: z.record(z.unknown()).optional().nullable(),
}); 