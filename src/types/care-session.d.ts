export interface CareSession {
    id: string;
    status: string;
    scheduledAt: string | null;
    completedAt: string | null;
}

export interface CareSessionsResponse {
    data: CareSession[];
} 