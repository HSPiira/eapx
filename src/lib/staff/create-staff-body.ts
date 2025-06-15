import { StaffFormValues } from "@/components/admin/clients/staff/staff-form";

interface CreateStaffFormData {
    clientId: string,
    data: StaffFormValues,
}

export function buildCreateStaffBody({ clientId, data }: CreateStaffFormData) {
    return {
        // User/Profile fields
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        preferredName: data.fullName,
        dob: data.dob,
        gender: data.gender,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactEmail: data.emergencyContactEmail,
        preferredLanguage: data.preferredLanguage,
        preferredContactMethod: data.preferredContactMethod,
        nationality: data.nationality,
        idNumber: data.idNumber,
        passportNumber: data.passportNumber,
        idType: data.idType,
        allergies: data.allergies || [],
        medicalConditions: data.medicalConditions || [],
        dietaryRestrictions: data.dietaryRestrictions || [],
        accessibilityNeeds: data.accessibilityNeeds || [],
        metadata: {
            clientId,
        },

        // Staff fields
        jobTitle: data.jobTitle,
        companyId: clientId,
        managementLevel: data.managementLevel,
        maritalStatus: data.maritalStatus,
        startDate: data.startDate || new Date().toISOString(),
        endDate: data.endDate,
        status: data.status || 'ACTIVE',
        qualifications: data.qualifications || [],
        specializations: data.specializations || [],
        preferredWorkingHours: data.preferredWorkingHours || {},
        employmentType: data.employmentType || 'FULL_TIME',
        educationLevel: data.educationLevel || 'HIGH_SCHOOL',
    };
}
