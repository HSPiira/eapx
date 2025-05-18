export interface QueryParams<TWhere, TInclude, TSelect> {
    where?: TWhere;
    take?: number;
    skip?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
    include?: TInclude;
    select?: TSelect;
    distinct?: string[];
}

export interface DatabaseClient<T, TWhere, TCreate, TUpdate, TInclude = unknown> {
    findMany(params: QueryParams<TWhere, TInclude, unknown>): Promise<T[]>;
    findUnique(params: { where: TWhere; include?: TInclude }): Promise<T | null>;
    create(params: { data: TCreate; include?: TInclude }): Promise<T>;
    update(params: { where: TWhere; data: TUpdate; include?: TInclude }): Promise<T>;
    delete(params: { where: TWhere }): Promise<T>;
    count(params: { where: TWhere }): Promise<number>;
    aggregate(params: {
        where?: TWhere;
        _sum?: Partial<Record<keyof T, boolean>>;
        _avg?: Partial<Record<keyof T, boolean>>;
        _count?: Partial<Record<keyof T, boolean>>;
    }): Promise<unknown>;
    groupBy(params: {
        by: (keyof T)[];
        where?: TWhere;
        _count?: boolean | Partial<Record<keyof T, boolean>>;
    }): Promise<unknown[]>;
}
