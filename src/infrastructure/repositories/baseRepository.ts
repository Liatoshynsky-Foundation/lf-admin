import { FilterQuery, Model, Types } from 'mongoose';

import dbConnect from '~/infrastructure/db/connect';

export type BaseEntity = {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type BaseFilters = {
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type BaseRepository<TEntity extends BaseEntity, TFilters extends BaseFilters = BaseFilters> = {
  findById(id: string): Promise<TEntity | null>;
  findAll(filters?: TFilters): Promise<TEntity[]>;
  update(id: string, input: Partial<Omit<TEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TEntity | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: Omit<TFilters, 'limit' | 'skip' | 'sortBy' | 'sortOrder'>): Promise<number>;
};

type CreateBaseRepositoryOptions<TEntity extends BaseEntity, TDbDoc, TFilters extends BaseFilters> = {
  model: Model<any>;
  toEntity: (doc: TDbDoc) => TEntity;
  buildQuery?: (filters?: Omit<TFilters, 'limit' | 'skip' | 'sortBy' | 'sortOrder'>) => FilterQuery<any>;
  getDefaultSort?: (filters?: TFilters) => Record<string, 1 | -1>;
};

export const createBaseRepository = <TEntity extends BaseEntity, TDbDoc, TFilters extends BaseFilters = BaseFilters>(
  options: CreateBaseRepositoryOptions<TEntity, TDbDoc, TFilters>
): BaseRepository<TEntity, TFilters> => {
  const { model, toEntity, buildQuery = () => ({}), getDefaultSort } = options;

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

      const query = buildQuery ? buildQuery(filters) : {};

      /* eslint-disable indent */
      const sort = getDefaultSort
        ? getDefaultSort(filters)
        : {
            [filters?.sortBy ?? 'createdAt']: filters?.sortOrder === 'asc' ? (1 as const) : (-1 as const)
          };

      const queryBuilder = model.find(query).sort(sort as any);

      if (filters?.skip) {
        queryBuilder.skip(filters.skip);
      }

      if (filters?.limit) {
        queryBuilder.limit(filters.limit);
      }

      const docs = await queryBuilder.lean<TDbDoc[]>();
      return docs.map(toEntity);
    },

    update: async (
      id: string,
      input: Partial<Omit<TEntity, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<TEntity | null> => {
      await dbConnect();

      if (!Types.ObjectId.isValid(id)) {
        return null;
      }

      const updated = await model
        .findByIdAndUpdate(id, input, {
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

    count: async (filters?: Omit<TFilters, 'limit' | 'skip' | 'sortBy' | 'sortOrder'>): Promise<number> => {
      await dbConnect();

      const query = buildQuery ? buildQuery(filters) : {};
      return model.countDocuments(query);
    }
  };
};
