import { FilterQuery } from 'mongoose';

import { BaseEntity, FiltersInput } from '~/domain/repositories/baseRepository';

export const createToEntity = <
    TEntity extends BaseEntity,
    TDb extends { _id: { toString(): string }; createdAt: string | Date; updatedAt: string | Date }
>(
    doc: TDb,
    extraFields: Omit<TEntity, keyof BaseEntity>
  ): TEntity => ({
    id: doc._id.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    ...extraFields
  } as TEntity);

export const buildBaseQuery = <TDb>(
  filters?: FiltersInput & { status?: string }
): FilterQuery<TDb> => {
  const query: Record<string, unknown> = {};

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.slug) {
    query.slug = filters.slug;
  }

  return query as FilterQuery<TDb>;
};

export const getBaseSort = (filters?: FiltersInput): Record<string, 1 | -1> => {
  if (filters?.sort?.length) {
    const { sortBy, sortOrder } = filters.sort[0];
    return {
      [sortBy]: sortOrder === 'asc' ? 1 : -1
    };
  }

  return { createdAt: -1 };
};
