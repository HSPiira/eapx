import {DatabaseClient} from "@/lib/database_client";

interface ListParams<TEntity = unknown> {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Partial<Record<keyof TEntity, any>>;
    sort?: {
        field: keyof TEntity;
        direction: 'asc' | 'desc';
    };
}

interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        pages: number;
        page: number;
        limit: number;
    };
}


export abstract class BaseProvider<
    TEntity,
    TCreate,
    TUpdate,
    TWhere,
    TInclude = unknown
> {
    protected abstract client: DatabaseClient<TEntity, TWhere, TCreate, TUpdate, TInclude>;
    protected abstract searchFields: (keyof TEntity)[];
    protected abstract defaultSort: { field: keyof TEntity; direction: 'asc' | 'desc' };
    protected includes?: TInclude = undefined;
    protected useSoftDelete: boolean = false;

    protected abstract transform(data: TEntity): TEntity;

    async list(params: ListParams): Promise<PaginatedResponse<TEntity>> {
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
            data: items.map(item => this.transform(item)),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        };
    }

    async get(id: string): Promise<TEntity | null> {
        const item = await this.client.findUnique({
            where: { id } as TWhere,
            include: this.includes
        });
        return item ? this.transform(item) : null;
    }

    async create(data: TCreate): Promise<TEntity> {
        await this.beforeCreate(data);
        const item = await this.client.create({
            data,
            include: this.includes
        });
        await this.afterCreate(item);
        return this.transform(item);
    }

    async update(id: string, data: TUpdate): Promise<TEntity> {
        await this.beforeUpdate(id, data);
        const item = await this.client.update({
            where: { id } as TWhere,
            data,
            include: this.includes
        });
        await this.afterUpdate(item);
        return this.transform(item);
    }

    async delete(id: string): Promise<TEntity> {
        await this.beforeDelete(id);
        const result = this.useSoftDelete
            ? await this.client.update({
                where: { id } as TWhere,
                data: { deletedAt: new Date() } as unknown as TUpdate,
                include: this.includes
            })
            : await this.client.delete({ where: { id } as TWhere });

        await this.afterDelete(result);
        return this.transform(result);
    }

    // Default where clause
    protected buildWhereClause(filters: Partial<TWhere>, search: string): TWhere {
        const base: Record<string, any> = { ...filters };

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
    protected async beforeCreate(data: TCreate): Promise<void> {}
    protected async afterCreate(result: TEntity): Promise<void> {}
    protected async beforeUpdate(id: string, data: TUpdate): Promise<void> {}
    protected async afterUpdate(result: TEntity): Promise<void> {}
    protected async beforeDelete(id: string): Promise<void> {}
    protected async afterDelete(result: TEntity): Promise<void> {}
}
