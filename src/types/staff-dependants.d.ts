import { BaseStatus, RelationType, EducationLevel, MaritalStatus, EmploymentType, ManagementLevel, Language } from './enums';

export interface StaffDependant {
    id: string;
    relation: RelationType;
    relationshipDetails?: string;
    dateOfBirth?: Date;
    isEmployed?: boolean;
    isStudent?: boolean;
    jobTitle?: string;
    educationLevel?: EducationLevel;
    maritalStatus?: MaritalStatus;
    employmentType?: EmploymentType;
    managementLevel?: ManagementLevel;
    vulnerabilityFlag?: boolean;
    isStaffLink: boolean;
    staffId: string;
    guardianId?: string;
    userLinkId?: string;
    status: BaseStatus;
    lastServiceDate?: Date;
    preferredLanguage?: Language;
    notes?: string;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    profile: {
        id: string;
        fullName: string;
    };
}

export interface StaffDependantResponse {
    data: StaffDependant[];
}