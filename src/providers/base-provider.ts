import { DatabaseClient } from "@/lib/database-client";

interface ListParams<TModel = unknown> {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Partial<Record<keyof TModel, unknown>>;
    sort?: {
        field: keyof TModel;
        direction: 'asc' | 'desc';
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        pages: number;
        page: number;
        limit: number;
    };
}

export abstract class BaseProvider<
    TModel,
    TCreate,
    TUpdate,
    TWhere,
    TInclude = unknown,
    TSource = TModel
> {
    protected abstract client: DatabaseClient<TModel, TWhere, TCreate, TUpdate, TInclude>;
    protected abstract searchFields: (keyof TModel)[];
    protected abstract defaultSort: { field: keyof TModel; direction: 'asc' | 'desc' };
    protected includes?: TInclude = undefined;
    protected useSoftDelete: boolean = false;
    protected abstract transform(data: TSource): TModel;

    async list(params: ListParams): Promise<PaginatedResponse<TModel>> {
        const {
            page = 1,
            limit = 10,
            search = '',
            filters = {},
            sort = this.defaultSort
        } = params;

        const where = this.buildWhereClause(filters as Partial<TWhere>, search);

        const [items, total] = await Promise.all([
            this.client.findMany({
                where,
                take: limit,
                skip: (page - 1) * limit,
                orderBy: sort?.field ? { [sort.field]: sort.direction } : undefined,
                include: this.includes
            }),
            this.client.count({ where })
        ]);

        return {
            data: items.map(item => this.transform(item as unknown as TSource)),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        };
    }

    async get(id: string): Promise<TModel | null> {
        const item = await this.client.findUnique({
            where: { id } as TWhere,
            include: this.includes
        });
        return item ? this.transform(item as unknown as TSource) : null;
    }

    async create(data: TCreate): Promise<TModel> {
        await this.beforeCreate();
        const item = await this.client.create({
            data,
            include: this.includes
        });
        await this.afterCreate();
        return this.transform(item as unknown as TSource);
    }

    async update(id: string, data: TUpdate): Promise<TModel> {
        await this.beforeUpdate();
        const item = await this.client.update({
            where: { id } as TWhere,
            data,
            include: this.includes
        });
        await this.afterUpdate();
        return this.transform(item as unknown as TSource);
    }

    async delete(id: string): Promise<TModel> {
        await this.beforeDelete();
        const result = this.useSoftDelete
            ? await this.client.update({
                where: { id } as TWhere,
                data: { deletedAt: new Date() } as unknown as TUpdate,
                include: this.includes
            })
            : await this.client.delete({ where: { id } as TWhere });

        await this.afterDelete();
        return this.transform(result as unknown as TSource);
    }

    // Default where clause
    protected buildWhereClause(filters: Partial<TWhere>, search: string): TWhere {
        const base: Record<string, unknown> = { ...filters };

        if (this.useSoftDelete) {
            base.deletedAt = null;
        }

        if (search && this.searchFields.length > 0) {
            base.OR = this.searchFields.map(field => ({
                [field]: { contains: search, mode: 'insensitive' }
            }));
        }

        return base as TWhere;
    }

    // Lifecycle hooks
    protected async beforeCreate(): Promise<void> { }
    protected async afterCreate(): Promise<void> { }
    protected async beforeUpdate(): Promise<void> { }
    protected async afterUpdate(): Promise<void> { }
    protected async beforeDelete(): Promise<void> { }
    protected async afterDelete(): Promise<void> { }
}
