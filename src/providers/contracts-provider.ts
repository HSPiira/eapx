import { DatabaseClient } from "@/lib/database-client";
import type { Contract, ContractStatus, PaymentStatus, Prisma } from "@prisma/client";
import { BaseProvider } from "./base-provider";
import { toDate, toISO } from "@/utils";

export interface ContractModel {
    id: string;
    clientId: string;
    startDate: string;
    endDate: string;
    renewalDate?: string | null;
    billingRate: number;
    isRenewable: boolean;
    isAutoRenew: boolean;
    paymentStatus: PaymentStatus;
    paymentFrequency?: string | null;
    paymentTerms?: string | null;
    currency?: string | null;
    lastBillingDate?: string | null;
    nextBillingDate?: string | null;
    documentUrl?: string | null;
    status: ContractStatus;
    signedBy?: string | null;
    signedAt?: string | null;
    terminationReason?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    client?: {
        id: string;
        name: string;
    };
}

export interface CreateContractInput {
    clientId: string;
    startDate: string;
    endDate: string;
    renewalDate?: string;
    billingRate: number;
    isRenewable?: boolean;
    isAutoRenew?: boolean;
    paymentStatus?: PaymentStatus;
    paymentFrequency?: string;
    paymentTerms?: string;
    currency?: string;
    documentUrl?: string;
    status?: ContractStatus;
    notes?: string;
}

export interface UpdateContractInput extends Partial<CreateContractInput> {
    signedBy?: string;
    signedAt?: string;
    terminationReason?: string;
}

export interface ContractFilters {
    clientId?: string;
    status?: ContractStatus;
    paymentStatus?: PaymentStatus;
    isRenewable?: boolean;
    endDateBefore?: Date;
    endDateAfter?: Date;
}

export class ContractProvider extends BaseProvider<
    ContractModel,
    CreateContractInput,
    UpdateContractInput,
    Prisma.ContractWhereInput,
    Prisma.ContractInclude,
    Contract & { client?: { id: string; name: string } }
> {
    protected client: DatabaseClient<
        ContractModel,
        Prisma.ContractWhereInput,
        CreateContractInput,
        UpdateContractInput,
        Prisma.ContractInclude
    >;

    protected searchFields: (keyof ContractModel)[] = ['notes', 'terminationReason'];
    protected defaultSort = { field: 'createdAt' as keyof ContractModel, direction: 'desc' as const };
    protected useSoftDelete = true;

    constructor(db: DatabaseClient<
        Contract,
        Prisma.ContractWhereInput,
        Prisma.ContractCreateInput,
        Prisma.ContractUpdateInput,
        Prisma.ContractInclude
    >) {
        super();
        this.client = {
            ...db,
            findMany: async (params) => {
                const results = await db.findMany(params);
                return results.map(this.transform);
            },
            findUnique: async (params) => {
                const result = await db.findUnique(params);
                return result ? this.transform(result) : null;
            },
            create: async (params) => {
                const result = await db.create({
                    ...params,
                    data: {
                        ...params.data,
                        client: { connect: { id: params.data.clientId } }
                    }
                });
                return this.transform(result);
            },
            update: async (params) => {
                const result = await db.update(params);
                return this.transform(result);
            },
            delete: async (params) => {
                const result = await db.delete(params);
                return this.transform(result);
            },
            count: db.count,
            aggregate: db.aggregate,
            groupBy: async (params) => {
                const prismaParams = {
                    ...params,
                    by: params.by.map(key => {
                        if (key === 'client') return 'clientId';
                        return key;
                    }) as (keyof Contract)[],
                };
                const result = await db.groupBy(prismaParams);
                return result;
            },
        };
    }

    protected includes: Prisma.ContractInclude = {
        client: {
            select: {
                id: true,
                name: true,
            },
        },
    };

    protected transform(contract: Contract & { client?: { id: string; name: string } }): ContractModel {
        return {
            id: contract.id,
            clientId: contract.clientId,
            startDate: toISO(contract.startDate) ?? '',
            endDate: toISO(contract.endDate) ?? '',
            renewalDate: toISO(contract.renewalDate),
            billingRate: contract.billingRate,
            isRenewable: contract.isRenewable,
            isAutoRenew: contract.isAutoRenew,
            paymentStatus: contract.paymentStatus,
            paymentFrequency: contract.paymentFrequency,
            paymentTerms: contract.paymentTerms,
            currency: contract.currency,
            lastBillingDate: toISO(contract.lastBillingDate),
            nextBillingDate: toISO(contract.nextBillingDate),
            documentUrl: contract.documentUrl,
            status: contract.status,
            signedBy: contract.signedBy,
            signedAt: toISO(contract.signedAt),
            terminationReason: contract.terminationReason,
            notes: contract.notes,
            createdAt: toISO(contract.createdAt) ?? '',
            updatedAt: toISO(contract.updatedAt) ?? '',
            client: contract.client ? {
                id: contract.client.id,
                name: contract.client.name,
            } : undefined,
        };
    }

    protected buildWhereClause(filters: Partial<Prisma.ContractWhereInput>, search: string): Prisma.ContractWhereInput {
        const where: Prisma.ContractWhereInput = {
            deletedAt: null,
        };

        if (filters.clientId) where.clientId = filters.clientId;
        if (filters.status) where.status = filters.status;
        if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
        if (filters.isRenewable !== undefined) where.isRenewable = filters.isRenewable;

        if (filters.endDate) {
            where.endDate = filters.endDate;
        }

        if (search) {
            where.OR = [
                { notes: { contains: search, mode: 'insensitive' } },
                { terminationReason: { contains: search, mode: 'insensitive' } },
                { client: { is: { name: { contains: search, mode: 'insensitive' } } } },
            ];
        }

        return where;
    }

    async create(input: CreateContractInput): Promise<ContractModel> {
        const data = {
            ...input,
            startDate: toDate(input.startDate) ?? new Date(),
            endDate: toDate(input.endDate) ?? new Date(),
            renewalDate: toDate(input.renewalDate),
        };

        return this.client.create({
            data: {
                ...data,
                startDate: data.startDate.toISOString(),
                endDate: data.endDate.toISOString(),
                renewalDate: data.renewalDate?.toISOString(),
            },
            include: this.includes,
        });
    }

    async findExpiring(days: number): Promise<ContractModel[]> {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() + days);

        return this.client.findMany({
            where: {
                deletedAt: null,
                status: 'ACTIVE',
                endDate: { lte: threshold, gt: new Date() },
            },
            orderBy: { endDate: 'asc' },
            include: this.includes,
        });
    }

    // Additional contract-specific methods
    async updateStatus(id: string, status: ContractStatus) {
        return this.update(id, { status });
    }

    async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
        return this.update(id, { paymentStatus });
    }
}