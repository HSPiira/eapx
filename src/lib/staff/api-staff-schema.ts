import { z } from "zod";

export const createStaffSchema = z.object({
    // Either profileId for existing users, or user details for new users
    profileId: z.string().optional(),
    userId: z.string().optional(),
    // User/Profile fields (required if profileId is not provided)
    email: z.string().email().optional(),
    fullName: z.string().trim().min(3, "Full name is required"),
    preferredName: z.string().optional().transform((val) => val?.trim()),
    phone: z.string().optional(),
    dob: z.preprocess((val) => new Date(val as string), z.date()).optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    address: z.string().optional(),
    idNumber: z.string().optional(),
    passportNumber: z.string().optional(),
    idType: z.enum(['PASSPORT', 'NATIONAL_ID', 'DRIVING_LICENSE', 'OTHER']).optional(),
    nationality: z.string().optional(),
    bloodType: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    medicalConditions: z.array(z.string()).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    accessibilityNeeds: z.array(z.string()).optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactEmail: z.string().email().optional(),
    preferredLanguage: z.enum(['ENGLISH', 'SPANISH', 'FRENCH', 'GERMAN', 'OTHER']).optional(),
    preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'SMS', 'WHATSAPP', 'OTHER']).optional(),
    metadata: z.any().optional(),

    // Staff fields
    jobTitle: z.string().optional()
    ,
    companyId: z.string().optional(),
    companyStaffId: z.string().optional(),
    managementLevel: z.enum(['JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE', 'OTHER']).optional(),
    maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).optional(),
    startDate: z.preprocess((val) => val ? new Date(val as string) : undefined, z.date()).optional(),
    endDate: z.preprocess((val) => val ? new Date(val as string) : undefined, z.date()).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
    qualifications: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
    preferredWorkingHours: z.any().optional(),
    employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'CONSULTANT']).optional(),
    educationLevel: z.enum(['HIGH_SCHOOL', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'PHD']).optional(),
}).refine(
    (data) => {
        // Either profileId or user details must be provided
        return (data.profileId != null && data.userId != null) ||
            (data.email != null && data.fullName != null);
    },
    {
        message: "Either provide both profileId and userId for existing users, or email and fullName to create a new user",
        path: ['profileId', 'userId', 'email', 'fullName']
    }
);

// Define custom error types
export interface CustomError extends Error {
    code?: string;
}

export type CreateStaffInput = z.infer<typeof createStaffSchema>;