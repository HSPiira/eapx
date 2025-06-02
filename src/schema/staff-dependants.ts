import { z } from "zod";

export const StaffDependantSchema = z.object({
    id: z.string().cuid(),
    profileId: z.string().cuid(),
    relation: z.enum(['CHILD', 'SPOUSE', 'PARENT', 'SIBLING', 'GRANDPARENT', 'GUARDIAN', 'FRIEND', 'NEIGHBOR', 'COUSIN', 'OTHER']),
    relationshipDetails: z.string().nullable(),
    dateOfBirth: z.string().nullable(),
    isEmployed: z.boolean().nullable(),
    isStudent: z.boolean().nullable(),
    jobTitle: z.string().nullable(),
    educationLevel: z.enum(['HIGH_SCHOOL', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'PHD']).nullable(),
    maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).nullable(),
    employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'CONSULTANT']).nullable(),
    managementLevel: z.enum(['JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE', 'OTHER']).nullable(),
    vulnerabilityFlag: z.boolean().nullable(),
    isStaffLink: z.boolean(),
    staffId: z.string().cuid(),
    guardianId: z.string().cuid().nullable(),
    userLinkId: z.string().cuid().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED', 'DELETED']),
    lastServiceDate: z.string().nullable(),
    preferredLanguage: z.enum(['ENGLISH', 'SPANISH', 'FRENCH', 'GERMAN', 'OTHER']).nullable(),
    notes: z.string().nullable(),
    deletedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

// Schema for creating a staff dependant (no id because it's generated)
const CreateStaffDependantInputSchema = StaffDependantSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
});

// Schema for updating a staff dependant (requires id)
export const UpdateStaffDependantInputSchema = StaffDependantSchema.pick({
    id: true,
}).extend(
    CreateStaffDependantInputSchema.shape // all other fields except id
);

export type StaffDependant = z.infer<typeof StaffDependantSchema>;
export type CreateStaffDependantInput = z.infer<typeof CreateStaffDependantInputSchema>;
export type UpdateStaffDependantInput = z.infer<typeof UpdateStaffDependantInputSchema>;
