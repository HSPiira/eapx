import { prisma } from '@/lib/prisma';
import { BaseProvider } from './base-provider';
import type { Document, Prisma, DocumentType } from '@prisma/client';
import type { DatabaseClient } from '@/lib/database-client';
import { PrismaWrapper } from '@/lib/prisma-wrapper';


// Domain model returned to consumers (can be extended if needed)
export type DocumentModel = Document;

// Filters passed to the provider
export interface DocumentFilters {
    clientId?: string;
    type?: DocumentType;
    isConfidential?: boolean;
}

// Input type when creating a document
export type CreateDocumentInput = Prisma.DocumentCreateInput;

// Input type when updating a document
export type UpdateDocumentInput = Prisma.DocumentUpdateInput;

// Document provider extending the generic BaseProvider
export class DocumentProvider extends BaseProvider<
    Document,                                // TEntity: Prisma model
    CreateDocumentInput,                     // TCreate
    UpdateDocumentInput,                     // TUpdate
    Prisma.DocumentWhereInput,               // TWhere
    Prisma.DocumentInclude                   // TInclude
> {
    // Database client initialized with the Prisma model
    protected client: DatabaseClient<
        Document,
        Prisma.DocumentWhereInput,
        Prisma.DocumentCreateInput,
        Prisma.DocumentUpdateInput,
        Prisma.DocumentInclude
    > = new PrismaWrapper(prisma.document);

    // Fields used for search functionality
    protected searchFields: (keyof Document)[] = ['title', 'description'];

    // Default sort field and direction
    protected defaultSort: { field: keyof Document; direction: 'asc' | 'desc' } = {
        field: 'createdAt',
        direction: 'desc',
    };

    // Include config for related entities (none in this case, so empty object)
    protected includes: Prisma.DocumentInclude = {};

    // Transforms the raw Prisma Document entity to the output model
    protected transform(data: Document): DocumentModel {
        return data;
    }

    /**
     * Converts filter and search params into a Prisma `where` clause.
     */
    protected buildWhereClause(
        filters: DocumentFilters,
        search: string
    ): Prisma.DocumentWhereInput {
        const where: Prisma.DocumentWhereInput = {};

        // Apply individual filters
        if (filters.clientId) where.clientId = filters.clientId;
        if (filters.type) where.type = filters.type;
        if (filters.isConfidential !== undefined) where.isConfidential = filters.isConfidential;

        // Apply text search across specified fields
        if (search) {
            where.OR = this.searchFields.map(field => ({
                [field]: { contains: search, mode: 'insensitive' }
            }));
        }

        return where;
    }

    /**
     * Retrieves all documents for a given client.
     */
    async listByClient(clientId: string): Promise<DocumentModel[]> {
        const documents = await this.client.findMany({
            where: { clientId },
            include: this.includes,
        });
        return documents.map(this.transform);
    }

    /**
     * Returns documents marked confidential.
     */
    async listConfidential(): Promise<DocumentModel[]> {
        const documents = await this.client.findMany({
            where: { isConfidential: true },
            include: this.includes,
        });
        return documents.map(this.transform);
    }
}