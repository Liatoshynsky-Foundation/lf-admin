import { BaseEntity, BaseFilters, BaseRepository } from '~/infrastructure/repositories/baseRepository/baseRepository';

export type BaseService<TEntity extends BaseEntity, TFilters extends BaseFilters = BaseFilters> = {
  getById(id: string): Promise<TEntity | null>;
  getAll(filters?: TFilters): Promise<TEntity[]>;
  update(id: string, input: Partial<Omit<TEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TEntity>;
  delete(id: string): Promise<boolean>;
  getCount(filters?: Omit<TFilters, 'limit' | 'skip' | 'sortBy' | 'sortOrder'>): Promise<number>;
  getPaginated(
    page: number,
    limit: number,
    filters?: Omit<TFilters, 'limit' | 'skip'>
  ): Promise<{ items: TEntity[]; total: number; page: number; totalPages: number }>;
};

type CreateBaseServiceOptions<TEntity extends BaseEntity, TFilters extends BaseFilters> = {
  repository: BaseRepository<TEntity, TFilters>;
  entityName: string;
};

export const createBaseService = <TEntity extends BaseEntity, TFilters extends BaseFilters = BaseFilters>(
  options: CreateBaseServiceOptions<TEntity, TFilters>
): BaseService<TEntity, TFilters> => {
  const { repository, entityName } = options;

  return {
    getById: async (id: string): Promise<TEntity | null> => {
      return repository.findById(id);
    },

    getAll: async (filters?: TFilters): Promise<TEntity[]> => {
      return repository.findAll(filters);
    },

    update: async (id: string, input: Partial<Omit<TEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TEntity> => {
      const updated = await repository.update(id, input);
      if (!updated) {
        throw new Error(`${entityName} not found: ${id}`);
      }
      return updated;
    },

    delete: async (id: string): Promise<boolean> => {
      const deleted = await repository.delete(id);
      if (!deleted) {
        throw new Error(`Failed to delete ${entityName}: ${id}`);
      }
      return deleted;
    },

    getCount: async (filters?: Omit<TFilters, 'limit' | 'skip' | 'sortBy' | 'sortOrder'>): Promise<number> => {
      return repository.count(filters);
    },

    getPaginated: async (
      page: number = 1,
      limit: number = 10,
      filters?: Omit<TFilters, 'limit' | 'skip'>
    ): Promise<{ items: TEntity[]; total: number; page: number; totalPages: number }> => {
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
          ) as Omit<TFilters, 'limit' | 'skip' | 'sortBy' | 'sortOrder'>)
        : undefined;

      const [items, total] = await Promise.all([repository.findAll(queryFilters), repository.count(countFilters)]);

      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }
  };
};
