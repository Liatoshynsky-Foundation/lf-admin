import { GraphQLError } from 'graphql';

import { compositionsServiceErrors } from '~/back-constants/errors';
import { ICompositionRepository } from '~/domain/repositories/compositionRepository';
import { compositionTitleSchema } from '~/validators/composition.schema';

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
    throw new GraphQLError(titleResult.error.issues[0]?.message ?? 'Введіть назву композиції.', {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }

  const name = titleResult.data;

  const existing = await repo.findByName(name);

  if (existing && existing.id !== excludeId) {
    throw compositionNameTakenError(name);
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
