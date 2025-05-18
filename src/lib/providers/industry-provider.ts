import { prisma } from "@/lib/prisma";
import { BaseProvider } from "./base-provider";
import type {
    Industry,
    Prisma
} from "@prisma/client";
import { DatabaseClient } from "@/lib/database_client";

// DTOs
export interface IndustryModel {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    parentId: string | null;
    parent?: {
        id: string;
        name: string;
        code: string | null;
    } | null;
    externalId: string | null;
    metadata: Prisma.JsonValue;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface CreateIndustryInput {
    name: string;
    code?: string;
    description?: string;
    parentId?: string;
    externalId?: string;
    metadata?: Record<string, unknown>;
}

export interface UpdateIndustryInput extends Partial<CreateIndustryInput> { }

export interface IndustryFilters {
    parentId?: string | null;
    externalId?: string;
}

interface DbIndustry extends Industry {
    parent?: Industry | null;
}

export class IndustryProvider extends BaseProvider<
    IndustryModel,                          // DB Entity
    Prisma.IndustryCreateInput,            // Create Input
    Prisma.IndustryUpdateInput,            // Update Input
    Prisma.IndustryWhereInput,             // Where Input
    Prisma.IndustryInclude                 // Include
> {
    protected client = prisma.industry as unknown as DatabaseClient<
        IndustryModel,
        Prisma.IndustryWhereInput,
        Prisma.IndustryCreateInput,
        Prisma.IndustryUpdateInput,
        Prisma.IndustryInclude
    >;

    protected searchFields: (keyof IndustryModel)[] = ['name', 'code', 'description'];

    protected defaultSort: { field: keyof IndustryModel; direction: 'asc' | 'desc' } = {
        field: 'name',
        direction: 'asc'
    };

    protected includes: Prisma.IndustryInclude = {
        parent: {
            select: {
                id: true,
                name: true,
                code: true
            }
        }
    };

    protected transform(data: unknown): IndustryModel {
        const industry = data as DbIndustry;
        return {
            id: industry.id,
            name: industry.name,
            code: industry.code,
            description: industry.description,
            parentId: industry.parentId,
            parent: industry.parent ? {
                id: industry.parent.id,
                name: industry.parent.name,
                code: industry.parent.code
            } : null,
            externalId: industry.externalId,
            metadata: industry.metadata,
            createdAt: industry.createdAt.toISOString(),
            updatedAt: industry.updatedAt.toISOString(),
            deletedAt: industry.deletedAt?.toISOString() || null
        };
    }

    protected buildWhereClause(filters: IndustryFilters, search: string): Prisma.IndustryWhereInput {
        const where: Prisma.IndustryWhereInput = {};

        if (filters.parentId !== undefined) {
            where.parentId = filters.parentId;
        }
        if (filters.externalId) {
            where.externalId = filters.externalId;
        }

        if (search) {
            where.OR = this.searchFields.map(field => ({
                [field]: { contains: search, mode: 'insensitive' }
            }));
        }

        where.deletedAt = null;

        return where;
    }

    async findByParent(parentId: string): Promise<IndustryModel[]> {
        const industries = await this.client.findMany({
            where: { parentId, deletedAt: null },
            include: this.includes,
        });
        return industries.map(industry => this.transform(industry));
    }

    async findRoot(): Promise<IndustryModel[]> {
        const industries = await this.client.findMany({
            where: { parentId: null, deletedAt: null },
            include: this.includes,
        });
        return industries.map(industry => this.transform(industry));
    }

    async findByExternalId(externalId: string): Promise<IndustryModel | null> {
        const industry = await this.client.findUnique({
            where: {
                externalId,
                deletedAt: null
            } as Prisma.IndustryWhereUniqueInput,
            include: this.includes
        });
        return industry ? this.transform(industry) : null;
    }
}
