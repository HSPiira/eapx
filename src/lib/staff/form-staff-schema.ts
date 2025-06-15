import { ContactMethod, WorkStatus, EducationLevel, EmploymentType, Gender, IdType, Language, ManagementLevel, MaritalStatus } from "@/types/enums";
import { z } from "zod";

const basicInformationSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    preferredName: z.string().optional(),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    dob: z.date().optional(),
    gender: z.nativeEnum(Gender),
    nationality: z.string().optional(),
    address: z.string().optional(),
    idNumber: z.string().optional(),
    passportNumber: z.string().optional(),
    idType: z.nativeEnum(IdType),
});

const emergencyContactSchema = z.object({
    emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
    emergencyContactPhone: z.string().min(1, 'Emergency contact phone is required'),
    emergencyContactEmail: z.string().email('Invalid email address'),
    preferredLanguage: z.nativeEnum(Language).optional(),
    preferredContactMethod: z.nativeEnum(ContactMethod).optional(),
});

const employmentDetailsSchema = z.object({
    companyId: z.string().min(1, 'Company ID is required'),
    jobTitle: z.string().optional(),
    companyStaffId: z.string().optional(),
    managementLevel: z.nativeEnum(ManagementLevel),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    maritalStatus: z.nativeEnum(MaritalStatus),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    status: z.nativeEnum(WorkStatus),
});

const healthInformationSchema = z.object({
    allergies: z.array(z.string()).optional(),
    medicalConditions: z.array(z.string()).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    accessibilityNeeds: z.array(z.string()).optional(),
});

const qualificationsSchema = z.object({
    educationLevel: z.nativeEnum(EducationLevel).optional(),
    qualifications: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
    preferredWorkingHours: z.record(z.string(), z.boolean()).optional(),
});

export const staffFormSchema = z.object({
    ...basicInformationSchema.shape,
    ...emergencyContactSchema.shape,
    ...employmentDetailsSchema.shape,
    ...healthInformationSchema.shape,
    ...qualificationsSchema.shape,
}).refine((data) => {
    // If ID type is selected, ID number is required
    if (data.idType && !data.idNumber) {
        return false;
    }
    // If ID number is provided, ID type is required
    if (data.idNumber && !data.idType) {
        return false;
    }
    return true;
}, {
    message: "Both ID type and ID number are required when providing identification",
    path: ["idNumber"]
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;