import { z } from "zod";

export const StaffSchema = z.object({
    id: z.string().cuid(),
    profileId: z.string().cuid(),
    clientId: z.string().cuid(),
    jobTitle: z.string(),
    companyId: z.string(),
    companyStaffId: z.string().nullable(),
    managementLevel: z.enum(['JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE', 'OTHER']),
    employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'CONSULTANT']).nullable(),
    educationLevel: z.enum(['HIGH_SCHOOL', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'PHD']).nullable(),
    maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']),
    startDate: z.string(),
    endDate: z.string().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED', 'SUSPENDED', 'RESIGNED']),
    qualifications: z.array(z.string()),
    specializations: z.array(z.string()),
    preferredWorkingHours: z.record(z.unknown()).nullable(),
    metadata: z.record(z.unknown()).nullable(),
    deletedAt: z.string().nullable(),
    userId: z.string().cuid(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

// Schema for creating a staff member (no id because it's generated)
const CreateStaffInputSchema = StaffSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
});

// Schema for updating a staff member (requires id)
export const UpdateStaffInputSchema = StaffSchema.pick({
    id: true,
}).extend(
    CreateStaffInputSchema.shape // all other fields except id
);

export type Staff = z.infer<typeof StaffSchema>;
export type CreateStaffInput = z.infer<typeof CreateStaffInputSchema>;
export type UpdateStaffInput = z.infer<typeof UpdateStaffInputSchema>;
