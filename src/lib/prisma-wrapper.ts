import type { DatabaseClient } from "@/lib/database-client";

type QueryParams<TWhere, TInclude, TSelect> = {
    where?: TWhere;
    take?: number;
    skip?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
    include?: TInclude;
    select?: TSelect;
    distinct?: string[];
};

/**
 * A generic wrapper for Prisma delegate operations.
 * Adds optional logging, error handling, and extensibility points.
 */
export class PrismaWrapper<
    TModel,
    TWhere extends Record<string, unknown>,
    TCreate,
    TUpdate,
    TInclude = unknown
> implements DatabaseClient<TModel, TWhere, TCreate, TUpdate, TInclude> {
    constructor(
        private readonly delegate: {
            findMany: (params: QueryParams<TWhere, TInclude, unknown>) => Promise<TModel[]>;
            findUnique: (params: { where: TWhere; include?: TInclude }) => Promise<TModel | null>;
            create: (params: { data: TCreate; include?: TInclude }) => Promise<TModel>;
            update: (params: { where: TWhere; data: TUpdate; include?: TInclude }) => Promise<TModel>;
            delete: (params: { where: TWhere }) => Promise<TModel>;
            count: (params: { where: TWhere }) => Promise<number>;
            aggregate: (params: {
                where?: TWhere;
                _sum?: Partial<Record<keyof TModel, boolean>>;
                _avg?: Partial<Record<keyof TModel, boolean>>;
                _count?: Partial<Record<keyof TModel, boolean>>;
            }) => Promise<unknown>;
            groupBy: (params: {
                by: (keyof TModel)[];
                where?: TWhere;
                _count?: boolean | Partial<Record<keyof TModel, boolean>>;
            }) => Promise<unknown[]>;
        }
    ) { }

    async findMany(params: QueryParams<TWhere, TInclude, unknown>): Promise<TModel[]> {
        this.log("findMany", params);
        return this.wrap(() => this.delegate.findMany(params));
    }

    async findUnique(params: { where: TWhere; include?: TInclude }): Promise<TModel | null> {
        this.log("findUnique", params);
        return this.wrap(() => this.delegate.findUnique(params));
    }

    async create(params: { data: TCreate; include?: TInclude }): Promise<TModel> {
        this.log("create", params);
        return this.wrap(() => this.delegate.create(params));
    }

    async update(params: { where: TWhere; data: TUpdate; include?: TInclude }): Promise<TModel> {
        this.log("update", params);
        return this.wrap(() => this.delegate.update(params));
    }

    async delete(params: { where: TWhere }): Promise<TModel> {
        this.log("delete", params);
        return this.wrap(() => this.delegate.delete(params));
    }

    async count(params: { where: TWhere }): Promise<number> {
        this.log("count", params);
        return this.wrap(() => this.delegate.count(params));
    }

    async aggregate(params: {
        where?: TWhere;
        _sum?: Partial<Record<keyof TModel, boolean>>;
        _avg?: Partial<Record<keyof TModel, boolean>>;
        _count?: Partial<Record<keyof TModel, boolean>>;
    }): Promise<unknown> {
        this.log("aggregate", params);
        return this.wrap(() => this.delegate.aggregate(params));
    }

    async groupBy(params: {
        by: (keyof TModel)[];
        where?: TWhere;
        _count?: boolean | Partial<Record<keyof TModel, boolean>>;
    }): Promise<unknown[]> {
        this.log("groupBy", params);
        return this.wrap(() => this.delegate.groupBy(params));
    }

    /** Central error handling wrapper */
    private async wrap<T>(fn: () => Promise<T>): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /** Logs the operation and its parameters */
    private log(operation: string, params: unknown) {
        if (process.env.NODE_ENV === "development") {
            console.debug(`[PrismaWrapper] ${operation}`, JSON.stringify(params, null, 2));
        }
    }

    /** Centralized error handling logic */
    private handleError(error: unknown) {
        if (error instanceof Error) {
            console.error(`[PrismaWrapper Error] ${error.message}`);
        } else {
            console.error(`[PrismaWrapper Unknown Error]`, error);
        }
    }
}
