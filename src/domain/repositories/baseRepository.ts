import { ClientSession } from 'mongoose';

import {SortByDate, SortOrder} from '~/types/enums/common.enums';

export type SortCriteria = {
    sortBy: SortByDate | string;
    sortOrder: SortOrder;
};

export type ContentLanguageFilter = 'uk' | 'en' | 'bilingual';

export type FiltersInput = {
    slug?: string | null;
    search?: string;
    languages?: ContentLanguageFilter[];
    sort?: SortCriteria[];
    limit?: number;
    skip?: number;
}

export type PaginationFilters = Pick<FiltersInput, 'limit' | 'skip'>;

export type QueryFilters<TFilters extends FiltersInput> = Omit<TFilters, keyof FiltersInput>;

export type BaseEntity = {
    id: string;
    createdAt: Date | string;
    updatedAt: Date | string;
};

export interface IBaseRepository<TEntity extends BaseEntity, TFilters extends FiltersInput = FiltersInput> {
    findById(id: string, session?: ClientSession): Promise<TEntity | null>;
    findBySlug(slug: string, session?: ClientSession): Promise<TEntity | null>;
    findAll(filters?: TFilters, session?: ClientSession): Promise<TEntity[]>;
    update(id: string, input: Partial<Omit<TEntity, keyof BaseEntity>>, session?: ClientSession): Promise<TEntity | null>;
    delete(id: string, session?: ClientSession): Promise<boolean>;
    count(filters?: QueryFilters<TFilters>, session?: ClientSession): Promise<number>;
    findPaginated(
        page: number,
        limit: number,
        filters?: Omit<TFilters, keyof PaginationFilters>,
        session?: ClientSession
    ): Promise<{ items: TEntity[]; total: number; page: number; totalPages: number }>;
}