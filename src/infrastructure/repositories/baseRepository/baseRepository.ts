import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';

import dbConnect from '~/infrastructure/db/connect';

export type BaseEntity = {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export interface PaginationFilters {
  limit?: number;
  skip?: number;
}

export interface BaseFilters extends PaginationFilters {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type QueryFilters<TFilters extends BaseFilters> = Omit<
  TFilters,
  keyof PaginationFilters | 'sortBy' | 'sortOrder'
>;

export type BaseRepository<TEntity extends BaseEntity, TFilters extends BaseFilters = BaseFilters> = {
  findById(id: string): Promise<TEntity | null>;
  findAll(filters?: TFilters): Promise<TEntity[]>;
  update(id: string, input: Partial<Omit<TEntity, keyof BaseEntity>>): Promise<TEntity | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: QueryFilters<TFilters>): Promise<number>;
};

type CreateBaseRepositoryOptions<TEntity extends BaseEntity, TDbDoc, TFilters extends BaseFilters> = {
  model: Model<TDbDoc>;
  toEntity: (doc: TDbDoc) => TEntity;
  buildQuery?: (filters?: QueryFilters<TFilters>) => FilterQuery<TDbDoc>;
  getDefaultSort?: (filters?: TFilters) => Record<string, 1 | -1>;
};

export const createBaseRepository = <TEntity extends BaseEntity, TDbDoc, TFilters extends BaseFilters = BaseFilters>(
  options: CreateBaseRepositoryOptions<TEntity, TDbDoc, TFilters>
): BaseRepository<TEntity, TFilters> => {
  const { model, toEntity, buildQuery = () => ({}), getDefaultSort } = options;

  const extractQueryFilters = (filters?: TFilters): QueryFilters<TFilters> | undefined => {
    if (!filters) return undefined;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { limit, skip, sortBy, sortOrder, ...queryFilters } = filters;
    return queryFilters as QueryFilters<TFilters>;
  };

  return {
    findById: async (id: string): Promise<TEntity | null> => {
      await dbConnect();

      if (!Types.ObjectId.isValid(id)) {
        return null;
      }

      const doc = await model.findById(id).lean<TDbDoc>();
      return doc ? toEntity(doc) : null;
    },

    findAll: async (filters?: TFilters): Promise<TEntity[]> => {
      await dbConnect();

      const query = buildQuery ? buildQuery(extractQueryFilters(filters)) : {};

      /* eslint-disable indent */
      const sort = getDefaultSort
        ? getDefaultSort(filters)
        : {
            [filters?.sortBy ?? 'createdAt']: filters?.sortOrder === 'asc' ? (1 as const) : (-1 as const)
          };

      const queryBuilder = model.find(query).sort(sort);

      if (filters?.skip) {
        queryBuilder.skip(filters.skip);
      }

      if (filters?.limit) {
        queryBuilder.limit(filters.limit);
      }

      const docs = await queryBuilder.lean<TDbDoc[]>();
      return docs.map(toEntity);
    },

    update: async (id: string, input: Partial<Omit<TEntity, keyof BaseEntity>>): Promise<TEntity | null> => {
      await dbConnect();

      if (!Types.ObjectId.isValid(id)) {
        return null;
      }

      const updated = await model
        .findByIdAndUpdate(id, input as unknown as UpdateQuery<TDbDoc>, {
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
};
