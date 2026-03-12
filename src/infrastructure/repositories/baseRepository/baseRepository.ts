import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';

import {
  BaseEntity,
  FiltersInput,
  IBaseRepository, PaginationFilters,
  QueryFilters,
  SortCriteria
} from '~/domain/repositories/baseRepository';
import dbConnect from '~/infrastructure/db/connect';

export const createBaseRepository = <
    TEntity extends BaseEntity,
    TDbDoc,
    TFilters extends FiltersInput
>(options: {
  model: Model<TDbDoc>;
  toEntity: (doc: TDbDoc) => TEntity;
  buildQuery?: (filters?: QueryFilters<TFilters>) => FilterQuery<TDbDoc>;
  getDefaultSort?: (filters?: TFilters) => Record<string, 1 | -1>;
}): IBaseRepository<TEntity, TFilters> => {
  const { model, toEntity, buildQuery = () => ({}), getDefaultSort } = options;

  const extractQueryFilters = (filters?: TFilters): QueryFilters<TFilters> | undefined => {
    if (!filters) return undefined;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { limit, skip, sortBy, sortOrder, ...queryFilters } = filters;
    return queryFilters as QueryFilters<TFilters>;
  };

  const repository = {
    findById: async (id: string): Promise<TEntity | null> => {
      await dbConnect();

      if (!Types.ObjectId.isValid(id)) {
        return null;
      }

      const doc = await model.findById(id).lean<TDbDoc>();
      return doc ? toEntity(doc) : null;
    },

    findBySlug: async (slug: string): Promise<TEntity | null> => {
      await dbConnect();

      if (!slug) {
        return null;
      }

      const doc = await model.findOne({ slug } as FilterQuery<TDbDoc>).lean<TDbDoc>();
      return doc ? toEntity(doc) : null;
    },

    findAll: async (filters?: TFilters): Promise<TEntity[]> => {
      await dbConnect();

      const query = buildQuery ? buildQuery(extractQueryFilters(filters as QueryFilters<TFilters>)) : {};

      let sort: { [p: string]: number } = { createdAt: -1 };

      if (filters?.sort && filters.sort.length > 0) {
        sort = {};
        filters.sort.forEach((item: SortCriteria) => {
          sort[item.sortBy] = item.sortOrder === 'asc' ? 1 : -1;
        });
      } else if (getDefaultSort) {
        sort = getDefaultSort(filters);
      }

      const queryBuilder = model.find(query).sort(sort);

      if (filters?.skip) {
        queryBuilder.skip(filters.skip);
      }

      if (filters?.limit) {
        queryBuilder.limit(filters.limit);
      }

      const docs = await queryBuilder.lean<TDbDoc[]>();
      return docs.map(doc => toEntity(doc as TDbDoc));
    },

    findPaginated: async (
      page: number = 1,
      limit: number = 10,
      filters?: Omit<TFilters, keyof PaginationFilters>
    ): Promise<{ items: TEntity[]; total: number; page: number; totalPages: number }> => {
      await dbConnect();

      const skip = (page - 1) * limit;

      const queryFilters = {
        ...filters,
        limit,
        skip
      } as TFilters;

      /* eslint-disable indent */
      const countFilters = filters
        ? (Object.fromEntries(
            Object.entries(filters).filter(([key]) => key !== 'sortBy' && key !== 'sortOrder')
          ) as Omit<TFilters, keyof FiltersInput>)
        : undefined;

      const [items, total] = await Promise.all([repository.findAll(queryFilters), repository.count(countFilters)]);

      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    },

    update: async (id: string, input: Partial<Omit<TEntity, keyof BaseEntity>>): Promise<TEntity | null> => {
      await dbConnect();

      if (!Types.ObjectId.isValid(id)) {
        return null;
      }

      const dataWithTimestamp = {
        ...input,
        updatedAt: new Date().toISOString()
      };

      const updated = await model
        .findByIdAndUpdate(id, dataWithTimestamp as unknown as UpdateQuery<TDbDoc>, {
          new: true,
          runValidators: true
        })
        .lean<TDbDoc>();

      return updated ? toEntity(updated) : null;
    },

    delete: async (id: string): Promise<boolean> => {
      await dbConnect();

      if (!Types.ObjectId.isValid(id)) {
        return false;
      }

      const result = await model.findByIdAndDelete(id);
      return result !== null;
    },

    count: async (filters?: QueryFilters<TFilters>): Promise<number> => {
      await dbConnect();

      const query = buildQuery ? buildQuery(filters) : {};
      return model.countDocuments(query);
    }
  };

  return repository;
};
