export interface Session {
    id: string;
    scheduledAt: string;
    duration: number;
    location: string;
    status: string;
    client: {
        name: string;
    };
    provider: {
        name: string;
    };
    intervention: {
        name: string;
    };
}

export interface SessionsResponse {
    data: Session[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface TestSessionResponse {
    sessionId: string;
}

export interface SendFeedbackLinkResponse {
    message: string;
}

export interface SessionCounts {
    upcoming: number;
    unconfirmed: number;
    recurring: number;
    past: number;
    canceled: number;
    drafts: number;
}
