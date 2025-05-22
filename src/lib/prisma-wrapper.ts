import type { DatabaseClient, QueryParams } from './database-client';
import type { Prisma } from '@prisma/client';

type PrismaDelegate<TModel> = {
    findMany: (args?: Prisma.Args<TModel, 'findMany'>) => Promise<TModel[]>;
    findUnique: (args: Prisma.Args<TModel, 'findUnique'>) => Promise<TModel | null>;
    create: (args: Prisma.Args<TModel, 'create'>) => Promise<TModel>;
    update: (args: Prisma.Args<TModel, 'update'>) => Promise<TModel>;
    delete: (args: Prisma.Args<TModel, 'delete'>) => Promise<TModel>;
    count: (args: Prisma.Args<TModel, 'count'>) => Promise<number>;
    aggregate: (args: Prisma.Args<TModel, 'aggregate'>) => Promise<unknown>;
    groupBy: (args: Prisma.Args<TModel, 'groupBy'>) => Promise<unknown[]>;
};

export class PrismaWrapper<TModel> implements DatabaseClient<
    TModel,
    Prisma.Args<TModel, 'findMany'>['where'],
    Prisma.Args<TModel, 'findUnique'>['where'],
    Prisma.Args<TModel, 'create'>['data'],
    Prisma.Args<TModel, 'update'>['data'],
    Prisma.Args<TModel, 'findMany'>['include']
> {
    constructor(private delegate: PrismaDelegate<TModel>) { }

    async findMany(params: QueryParams<Prisma.Args<TModel, 'findMany'>['where'], Prisma.Args<TModel, 'findMany'>['include'], unknown>): Promise<TModel[]> {
        return this.delegate.findMany(params as Prisma.Args<TModel, 'findMany'>);
    }

    async findUnique(params: { where: Prisma.Args<TModel, 'findUnique'>['where']; include?: Prisma.Args<TModel, 'findMany'>['include'] }): Promise<TModel | null> {
        return this.delegate.findUnique(params as Prisma.Args<TModel, 'findUnique'>);
    }

    async create(params: { data: Prisma.Args<TModel, 'create'>['data']; include?: Prisma.Args<TModel, 'findMany'>['include'] }): Promise<TModel> {
        return this.delegate.create(params as Prisma.Args<TModel, 'create'>);
    }

    async update(params: { where: Prisma.Args<TModel, 'update'>['where']; data: Prisma.Args<TModel, 'update'>['data']; include?: Prisma.Args<TModel, 'findMany'>['include'] }): Promise<TModel> {
        return this.delegate.update(params as Prisma.Args<TModel, 'update'>);
    }

    async delete(params: { where: Prisma.Args<TModel, 'delete'>['where'] }): Promise<TModel> {
        return this.delegate.delete(params as Prisma.Args<TModel, 'delete'>);
    }

    async count(params: { where: Prisma.Args<TModel, 'count'>['where'] }): Promise<number> {
        return this.delegate.count(params as Prisma.Args<TModel, 'count'>);
    }

    async aggregate(params: {
        where?: Prisma.Args<TModel, 'aggregate'>['where'];
        _sum?: Partial<Record<keyof TModel, boolean>>;
        _avg?: Partial<Record<keyof TModel, boolean>>;
        _count?: Partial<Record<keyof TModel, boolean>>;
    }): Promise<unknown> {
        return this.delegate.aggregate(params as Prisma.Args<TModel, 'aggregate'>);
    }

    async groupBy(params: {
        by: (keyof TModel)[];
        where?: Prisma.Args<TModel, 'groupBy'>['where'];
        _count?: boolean | Partial<Record<keyof TModel, boolean>>;
    }): Promise<unknown[]> {
        return this.delegate.groupBy(params as Prisma.Args<TModel, 'groupBy'>);
    }
}
