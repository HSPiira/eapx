import { WorkStatus, ManagementLevel, EmploymentType, EducationLevel, MaritalStatus } from './enums';

export interface Staff {
    id: string;
    jobTitle: string;
    companyId: string;
    companyStaffId?: string;
    managementLevel: ManagementLevel;
    employmentType?: EmploymentType;
    educationLevel?: EducationLevel;
    maritalStatus: MaritalStatus;
    startDate: Date;
    endDate?: Date;
    status: WorkStatus;
    qualifications: string[];
    specializations: string[];
    preferredWorkingHours?: Record<string, any>;
    metadata?: Record<string, any>;
    profile: {
        id: string;
        fullName: string;
    };
    client: {
        id: string;
        name: string;
    };
    deletedAt?: Date;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface StaffResponse {
    data: Staff[];
}