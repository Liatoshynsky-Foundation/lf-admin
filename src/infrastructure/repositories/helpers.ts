import { FilterQuery } from 'mongoose';

import { BaseEntity, FiltersInput } from '~/domain/repositories/baseRepository';

const NON_EMPTY_STRING_QUERY = { $nin: ['', null] } as const;
const EMPTY_STRING_QUERY = { $in: ['', null] } as const;
const DEFAULT_SEARCH_FIELDS = [
  'adminTitle',
  'title.uk',
  'title.en'
] as const;

const escapeRegex = (value: string): string => value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

const DEFAULT_LANGUAGE_CONDITIONS = 'title' as const;

const getLanguageCondition = <TDb>(
  language: string,
  fieldPrefix: string = 'title'
): FilterQuery<TDb> | null => {
  const primary = `${fieldPrefix}.uk`;
  const secondary = `${fieldPrefix}.en`;

  if (language === 'uk') {
    return {
      $and: [{ [primary]: NON_EMPTY_STRING_QUERY }, { [secondary]: EMPTY_STRING_QUERY }]
    } as FilterQuery<TDb>;
  }
  if (language === 'en') {
    return {
      $and: [{ [secondary]: NON_EMPTY_STRING_QUERY }, { [primary]: EMPTY_STRING_QUERY }]
    } as FilterQuery<TDb>;
  }
  if (language === 'bilingual') {
    return {
      $and: [{ [primary]: NON_EMPTY_STRING_QUERY }, { [secondary]: NON_EMPTY_STRING_QUERY }]
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
  ): TEntity =>
  ({
    id: doc._id.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    ...extraFields
  }) as TEntity;

export const buildBaseQuery = <TDb>(
  filters?: FiltersInput & { statuses?: string[]; ids?: string[] },
  searchFields: readonly string[] = DEFAULT_SEARCH_FIELDS,
  languageField: string = DEFAULT_LANGUAGE_CONDITIONS
): FilterQuery<TDb> => {
  const conditions: FilterQuery<TDb>[] = [];

  if (filters?.ids?.length) {
    conditions.push({
      _id: { $in: filters.ids }
    } as FilterQuery<TDb>);
  }

  if (filters?.statuses?.length) {
    conditions.push({ status: { $in: filters.statuses } } as FilterQuery<TDb>);
  }

  if (filters?.ids?.length) {
    conditions.push({ _id: { $in: filters.ids } } as FilterQuery<TDb>);
  }

  if (filters?.slug) {
    conditions.push({ slug: filters.slug } as FilterQuery<TDb>);
  }

  if (filters?.search?.trim() && searchFields.length) {
    const regex = new RegExp(escapeRegex(filters.search.trim()), 'i');

    conditions.push({
      $or: searchFields.map((field) => ({
        [field]: regex
      }))
    } as FilterQuery<TDb>);
  }

  if (filters?.languages?.length) {
    const languageConditions = filters.languages
      .map((language) => getLanguageCondition<TDb>(language, languageField))
      .filter((condition): condition is FilterQuery<TDb> => Boolean(condition));

    if (languageConditions.length) {
      conditions.push({ $or: languageConditions } as FilterQuery<TDb>);
    }
  }

  if (!conditions.length) {
    return {} as FilterQuery<TDb>;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { $and: conditions } as FilterQuery<TDb>;
};

export const getBaseSort = (
  filters?: FiltersInput,
  fieldMap: Record<string, string> = {}
): Record<string, 1 | -1> => {
  if (filters?.sort?.length) {
    const { sortBy, sortOrder } = filters.sort[0];

    return {
      [fieldMap[sortBy] ?? sortBy]: sortOrder === 'asc' ? 1 : -1
    };
  }

  return { createdAt: -1 };
};

export const fieldCondition = <TDb>(
  field: string,
  value: string | string[] | undefined | null,
  fallbackValue?: string
): FilterQuery<TDb> | null => {
  const isEmpty = value === undefined || value === null || (Array.isArray(value) && value.length === 0);
  if (isEmpty) {
    return null;
  }

  const values = Array.isArray(value) ? value : [value];
  const includesFallback = fallbackValue !== undefined && values.includes(fallbackValue);

  if (!includesFallback) {
    return { [field]: Array.isArray(value) ? { $in: values } : value } as FilterQuery<TDb>;
  }

  const fallbackCondition = {
    $or: [{ [field]: fallbackValue }, { [field]: { $exists: false } }, { [field]: null }]
  };

  const otherValues = values.filter((v) => v !== fallbackValue);
  if (otherValues.length === 0) {
    return fallbackCondition as FilterQuery<TDb>;
  }

  return { $or: [fallbackCondition, { [field]: { $in: otherValues } }] } as FilterQuery<TDb>;
};

export const combineConditions = <TDb>(
  conditions: (FilterQuery<TDb> | null | undefined)[]
): FilterQuery<TDb> => {
  const nonEmpty = conditions.filter(
    (c): c is FilterQuery<TDb> => Boolean(c && Object.keys(c).length > 0)
  );

  if (nonEmpty.length === 0) return {} as FilterQuery<TDb>;
  if (nonEmpty.length === 1) return nonEmpty[0];
  return { $and: nonEmpty } as FilterQuery<TDb>;
};


