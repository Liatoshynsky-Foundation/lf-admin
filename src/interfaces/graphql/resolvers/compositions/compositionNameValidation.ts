import { GraphQLError } from 'graphql';

import { compositionsServiceErrors } from '~/back-constants/errors';
import { ICompositionRepository } from '~/domain/repositories/compositionRepository';
import { compositionGenreSchema, compositionTitleSchema, compositionYearSchema } from '~/validators/composition.schema';

type DuplicateKeyError = {
  code?: unknown;
  keyValue?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const normalizeCompositionName = (name: string): string => name.trim();

export const compositionNameTakenError = (name: string): GraphQLError =>
  new GraphQLError(compositionsServiceErrors.COMPOSITION_NAME_TAKEN(normalizeCompositionName(name)), {
    extensions: { code: 'COMPOSITION_NAME_TAKEN' }
  });

export const assertCompositionNameNotTaken = async (
  repo: ICompositionRepository,
  ukName: string,
  excludeId?: string
): Promise<void> => {
  const titleResult = compositionTitleSchema.safeParse(ukName);
  if (!titleResult.success) {
    throw new GraphQLError(titleResult.error.issues[0].message, {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }

  const name = titleResult.data;

  const existing = await repo.findByName(name);

  if (existing && existing.id !== excludeId) {
    throw compositionNameTakenError(name);
  }
};

export const assertCompositionGenreValid = (genre?: string | null): void => {
  if (genre === undefined || genre === null) return;

  const result = compositionGenreSchema.safeParse(genre);
  if (!result.success) {
    throw new GraphQLError(result.error.issues[0].message, {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }
};

export const assertCompositionYearValid = (year?: number | null): void => {
  if (year === undefined || year === null) return;

  const result = compositionYearSchema.safeParse(String(year));
  if (!result.success) {
    throw new GraphQLError(result.error.issues[0].message, {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }
};

export const throwIfCompositionNameDuplicateKey = (error: unknown, fallbackName: string): void => {
  if (!isRecord(error) || error.code !== 11000) {
    return;
  }

  const keyValue = (error as DuplicateKeyError).keyValue;
  const duplicateName = isRecord(keyValue) ? keyValue['name.uk'] : undefined;

  throw compositionNameTakenError(typeof duplicateName === 'string' ? duplicateName : fallbackName);
};
