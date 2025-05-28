// import { prisma } from '@/lib/prisma';
// import { BaseProvider } from './base-provider';
// import { Contract, Prisma, ContractStatus, PaymentStatus } from '@prisma/client';
// import type { DatabaseClient } from '@/lib/database-client';
// import { PrismaWrapper } from '@/lib/prisma-wrapper';
// import { toISO } from '@/utils';

// // Domain model returned to consumers
// export interface ContractModel {
//     id: string;
//     clientId: string;
//     startDate: string;
//     endDate: string;
//     renewalDate?: string | null;
//     billingRate: number;
//     isRenewable: boolean;
//     isAutoRenew: boolean;
//     paymentStatus: PaymentStatus;
//     paymentFrequency?: string | null;
//     paymentTerms?: string | null;
//     currency?: string | null;
//     lastBillingDate?: string | null;
//     nextBillingDate?: string | null;
//     documentUrl?: string | null;
//     status: ContractStatus;
//     signedBy?: string | null;
//     signedAt?: string | null;
//     terminationReason?: string | null;
//     notes?: string | null;
//     createdAt: string;
//     updatedAt: string;
//     deletedAt?: string | null;
//     client?: {
//         id: string;
//         name: string;
//     };
// }

// // Filters passed to the provider
// export interface ContractFilters {
//     clientId?: string;
//     status?: ContractStatus;
//     paymentStatus?: PaymentStatus;
//     isRenewable?: boolean;
//     isAutoRenew?: boolean;
// }

// // Input type when creating a contract
// export type CreateContractInput = Prisma.ContractCreateInput;

// // Input type when updating a contract
// export type UpdateContractInput = Prisma.ContractUpdateInput;

// // Base class to handle type conversions
// class ContractDatabaseClient implements DatabaseClient<
//     ContractModel,
//     Prisma.ContractWhereInput,
//     Prisma.ContractWhereUniqueInput,
//     Prisma.ContractCreateInput,
//     Prisma.ContractUpdateInput,
//     Prisma.ContractInclude
// > {
//     protected prismaClient: DatabaseClient<
//         Contract,
//         Prisma.ContractWhereInput,
//         Prisma.ContractWhereUniqueInput,
//         Prisma.ContractCreateInput,
//         Prisma.ContractUpdateInput,
//         Prisma.ContractInclude
//     >;

//     constructor() {
//         this.prismaClient = new PrismaWrapper(prisma.contract);
//     }

//     public transform(data: Contract & { client?: { id: string; name: string } }): ContractModel {
//         return {
//             id: data.id,
//             clientId: data.clientId,
//             startDate: toISO(data.startDate) ?? '',
//             endDate: toISO(data.endDate) ?? '',
//             renewalDate: data.renewalDate ? toISO(data.renewalDate) : null,
//             billingRate: data.billingRate,
//             isRenewable: data.isRenewable,
//             isAutoRenew: data.isAutoRenew,
//             paymentStatus: data.paymentStatus,
//             paymentFrequency: data.paymentFrequency,
//             paymentTerms: data.paymentTerms,
//             currency: data.currency,
//             lastBillingDate: data.lastBillingDate ? toISO(data.lastBillingDate) : null,
//             nextBillingDate: data.nextBillingDate ? toISO(data.nextBillingDate) : null,
//             documentUrl: data.documentUrl,
//             status: data.status,
//             signedBy: data.signedBy,
//             signedAt: data.signedAt ? toISO(data.signedAt) : null,
//             terminationReason: data.terminationReason,
//             notes: data.notes,
//             createdAt: toISO(data.createdAt) ?? '',
//             updatedAt: toISO(data.updatedAt) ?? '',
//             deletedAt: data.deletedAt ? toISO(data.deletedAt) : null,
//             client: data.client
//         };
//     }

//     async findMany(params: {
//         where?: Prisma.ContractWhereInput;
//         take?: number;
//         skip?: number;
//         orderBy?: Record<string, 'asc' | 'desc'>;
//         include?: Prisma.ContractInclude;
//     }): Promise<ContractModel[]> {
//         const results = await this.prismaClient.findMany(params);
//         return results.map(this.transform);
//     }

//     async findUnique(params: {
//         where: Prisma.ContractWhereUniqueInput;
//         include?: Prisma.ContractInclude;
//     }): Promise<ContractModel | null> {
//         const result = await this.prismaClient.findUnique(params);
//         return result ? this.transform(result) : null;
//     }

//     async create(params: {
//         data: Prisma.ContractCreateInput;
//         include?: Prisma.ContractInclude;
//     }): Promise<ContractModel> {
//         const result = await this.prismaClient.create(params);
//         return this.transform(result);
//     }

//     async update(params: {
//         where: Prisma.ContractWhereUniqueInput;
//         data: Prisma.ContractUpdateInput;
//         include?: Prisma.ContractInclude;
//     }): Promise<ContractModel> {
//         const result = await this.prismaClient.update(params);
//         return this.transform(result);
//     }

//     async delete(params: {
//         where: Prisma.ContractWhereUniqueInput;
//     }): Promise<ContractModel> {
//         const result = await this.prismaClient.delete(params);
//         return this.transform(result);
//     }

//     async count(params: {
//         where: Prisma.ContractWhereInput;
//     }): Promise<number> {
//         return this.prismaClient.count(params);
//     }

//     async aggregate(params: {
//         where?: Prisma.ContractWhereInput;
//         _sum?: Partial<Record<keyof Contract, boolean>>;
//         _avg?: Partial<Record<keyof Contract, boolean>>;
//         _count?: Partial<Record<keyof Contract, boolean>>;
//     }): Promise<unknown> {
//         return this.prismaClient.aggregate(params);
//     }

//     async groupBy(params: {
//         by: (keyof Contract)[];
//         where?: Prisma.ContractWhereInput;
//         _count?: boolean | Partial<Record<keyof Contract, boolean>>;
//     }): Promise<unknown[]> {
//         return this.prismaClient.groupBy(params);
//     }
// }

// // Contract provider extending both BaseProvider and ContractDatabaseClient
// export class ContractProvider extends BaseProvider<
//     ContractModel,                           // TEntity: Domain model
//     CreateContractInput,                     // TCreate
//     UpdateContractInput,                     // TUpdate
//     Prisma.ContractWhereInput,               // TWhere
//     Prisma.ContractWhereUniqueInput,         // TWhereUnique
//     Prisma.ContractInclude,                  // TInclude
//     Contract & { client?: { id: string; name: string } } // TSource: Prisma model with includes
// > {
//     // Database client initialized with the Prisma model
//     protected client: ContractDatabaseClient;

//     constructor() {
//         super();
//         this.client = new ContractDatabaseClient();
//     }

//     // Fields used for search functionality
//     protected searchFields: (keyof Contract)[] = ['notes', 'paymentTerms'];

//     // Default sort field and direction
//     protected defaultSort: { field: keyof Contract; direction: 'asc' | 'desc' } = {
//         field: 'createdAt',
//         direction: 'desc',
//     };

//     // Include config for related entities
//     protected includes: Prisma.ContractInclude = {
//         client: {
//             select: {
//                 id: true,
//                 name: true
//             }
//         }
//     };

//     // Transforms the raw Prisma Contract entity to the output model
//     protected transform(data: Contract & { client?: { id: string; name: string } }): ContractModel {
//         return this.client.transform(data);
//     }

//     /**
//      * Converts filter and search params into a Prisma `where` clause.
//      */
//     protected buildWhereClause(
//         filters: ContractFilters,
//         search: string
//     ): Prisma.ContractWhereInput {
//         const where: Prisma.ContractWhereInput = {};

//         // Apply individual filters
//         if (filters.clientId) where.clientId = filters.clientId;
//         if (filters.status) where.status = filters.status;
//         if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
//         if (filters.isRenewable !== undefined) where.isRenewable = filters.isRenewable;
//         if (filters.isAutoRenew !== undefined) where.isAutoRenew = filters.isAutoRenew;

//         // Apply text search across specified fields
//         if (search) {
//             where.OR = this.searchFields.map(field => ({
//                 [field]: { contains: search, mode: 'insensitive' }
//             }));
//         }

//         return where;
//     }

//     /**
//      * Retrieves all contracts for a given client.
//      */
//     async listByClient(clientId: string): Promise<ContractModel[]> {
//         const contracts = await this.client.findMany({
//             where: { clientId },
//             include: this.includes,
//         });
//         return contracts;
//     }

//     /**
//      * Returns contracts that are due for renewal.
//      */
//     async listDueForRenewal(): Promise<ContractModel[]> {
//         const contracts = await this.client.findMany({
//             where: {
//                 isRenewable: true,
//                 endDate: {
//                     lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
//                 }
//             },
//             include: this.includes,
//         });
//         return contracts;
//     }

//     /**
//      * Returns contracts with overdue payments.
//      */
//     async listOverdue(): Promise<ContractModel[]> {
//         const contracts = await this.client.findMany({
//             where: {
//                 paymentStatus: PaymentStatus.OVERDUE,
//                 status: ContractStatus.ACTIVE
//             },
//             include: this.includes,
//         });
//         return contracts;
//     }
// }