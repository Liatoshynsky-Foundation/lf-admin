import { COMPOSITION_NAME_REQUIRED_ERROR } from '~/constants/opus';
import { compositionGenreSchema, compositionTitleSchema, compositionYearSchema } from '~/validators/composition.schema';

type CompositionValidationInput = {
  id: string;
  name: string;
  genre?: unknown;
  year?: unknown;
};

export const getCompositionFieldErrors = (
  compositions: CompositionValidationInput[]
): Record<string, string> => {
  const errors: Record<string, string> = {};

  compositions.forEach((composition) => {
    const basePath = `compositions.${composition.id}`;
    const titleResult = compositionTitleSchema.safeParse(composition.name);
    const genreResult = compositionGenreSchema.safeParse(composition.genre ?? '');
    const yearResult = compositionYearSchema.safeParse(composition.year ?? '');

    if (!titleResult.success) {
      errors[`${basePath}.name`] = titleResult.error.issues[0].message;
    }
    if (!genreResult.success) {
      errors[`${basePath}.genre`] = genreResult.error.issues[0].message;
    }
    if (!yearResult.success) {
      errors[`${basePath}.year`] = yearResult.error.issues[0].message;
    }
  });

  return errors;
};

export const normalizeCompositionName = (name: string): string =>
  name.trim().toLocaleLowerCase('uk-UA');

export const getDuplicateCompositionIds = <T extends { id: string; name: string }>(
  compositions: T[]
): string[] => {
  const idsByName = new Map<string, string[]>();

  compositions.forEach((composition) => {
    const name = normalizeCompositionName(composition.name);
    if (!name) return;

    const ids = idsByName.get(name) ?? [];
    ids.push(composition.id);
    idsByName.set(name, ids);
  });

  return Array.from(idsByName.values())
    .filter((ids) => ids.length > 1)
    .flat();
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error';
};

export const getDuplicateCompositionError = (
  error: unknown
): { name: string; message: string } | null => {
  if (!(error instanceof Error)) {
    return null;
  }
  const match = /^Композиція "([^"]+)" вже існує$/.exec(error.message);

  if (!match?.[1]) {
    return null;
  }

  return {
    name: normalizeCompositionName(match[1]),
    message: error.message
  };
};

export const getInvalidCompositionIds = <
  T extends { id: string; name: string }
>(
    compositions: T[]
  ): string[] =>
    compositions
      .filter((composition) => !composition.name.trim())
      .map((composition) => composition.id);

export const isCompositionNameRequiredError = (
  error: unknown
): boolean =>
  getErrorMessage(error) === 'Composition name is required';

export const getCompositionNameRequiredMessage = (): string =>
  COMPOSITION_NAME_REQUIRED_ERROR;

export const getDuplicateCompositionName = (error: unknown): string | null => {
  if (!(error instanceof Error)) {
    return null;
  }

  const match = /"([^"]+)"/.exec(error.message);

  return match?.[1] ? normalizeCompositionName(match[1]) : null;
};
