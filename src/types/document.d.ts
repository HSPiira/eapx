export interface Document {
    id: string;
    title: string;
    type: string;
    url: string;
}

export interface DocumentsResponse {
    data: Document[];
} 