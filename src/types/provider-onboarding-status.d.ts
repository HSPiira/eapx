export interface ProviderOnboardingStatus {
    id: string;
    hasSubmittedKYC: boolean;
    hasSignedContract: boolean;
    servicesAligned: boolean;
    documentsComplete: boolean;
}

export interface ProviderOnboardingStatusResponse {
    data: ProviderOnboardingStatus[];
} 