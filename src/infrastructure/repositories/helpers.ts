import { FilterQuery } from 'mongoose';

import { BaseEntity, FiltersInput } from '~/domain/repositories/baseRepository';

const NON_EMPTY_STRING_QUERY = { $nin: ['', null] } as const;
const EMPTY_STRING_QUERY = { $in: ['', null] } as const;

const escapeRegex = (value: string): string => value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

const getLanguageCondition = <TDb>(language: string): FilterQuery<TDb> | null => {
  if (language === 'uk') {
    return {
      $and: [
        { 'title.uk': NON_EMPTY_STRING_QUERY },
        { 'title.en': EMPTY_STRING_QUERY }
      ]
    } as FilterQuery<TDb>;
  }

  if (language === 'en') {
    return {
      $and: [
        { 'title.en': NON_EMPTY_STRING_QUERY },
        { 'title.uk': EMPTY_STRING_QUERY }
      ]
    } as FilterQuery<TDb>;
  }

  if (language === 'bilingual') {
    return {
      $and: [
        { 'title.uk': NON_EMPTY_STRING_QUERY },
        { 'title.en': NON_EMPTY_STRING_QUERY }
      ]
    } as FilterQuery<TDb>;
  }

  return null;
};

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
  filters?: FiltersInput & { status?: string; statuses?: string[] }
): FilterQuery<TDb> => {
  const baseQuery: Record<string, unknown> = {};
  const compoundConditions: FilterQuery<TDb>[] = [];

  if (filters?.statuses?.length) {
    baseQuery.status = { $in: filters.statuses };
  } else if (filters?.status) {
    baseQuery.status = filters.status;
  }

  if (filters?.slug) {
    baseQuery.slug = filters.slug;
  }

  if (filters?.search?.trim()) {
    const searchRegex = new RegExp(escapeRegex(filters.search.trim()), 'i');

    compoundConditions.push({
      $or: [
        { adminTitle: searchRegex },
        { 'title.uk': searchRegex },
        { 'title.en': searchRegex }
      ]
    } as FilterQuery<TDb>);
  }

  if (filters?.languages?.length) {
    const languageConditions = filters.languages
      .map((language) => getLanguageCondition<TDb>(language))
      .filter((condition): condition is FilterQuery<TDb> => Boolean(condition));

    if (languageConditions.length) {
      compoundConditions.push({ $or: languageConditions } as FilterQuery<TDb>);
    }
  }

  const hasBaseQuery = Object.keys(baseQuery).length > 0;

  if (!hasBaseQuery && !compoundConditions.length) {
    return {} as FilterQuery<TDb>;
  }

  if (!compoundConditions.length) {
    return baseQuery as FilterQuery<TDb>;
  }

  if (!hasBaseQuery && compoundConditions.length === 1) {
    return compoundConditions[0];
  }

  return {
    $and: [
      ...(hasBaseQuery ? [baseQuery as FilterQuery<TDb>] : []),
      ...compoundConditions
    ]
  } as FilterQuery<TDb>;
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
