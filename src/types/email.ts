
export interface EmailResponse {
    id: string | null;
    status: 'sent' | 'failed';
    error?: string;
}

export interface BulkEmailResponse {
    emails: EmailResponse[];
    total: number;
    successful: number;
    failed: number;
} 