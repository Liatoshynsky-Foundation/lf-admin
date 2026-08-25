import { GraphQLError } from 'graphql';

import {
  assertCompositionGenreValid,
  assertCompositionNameNotTaken,
  assertCompositionYearValid,
  normalizeCompositionName,
  throwIfCompositionNameDuplicateKey
} from './compositionNameValidation';
import { resolveSheetMusicFileNames, syncCompositionMediaUsageRefs } from './sheetMusicAssets';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import type { Composition } from '~/domain/entities/Composition';
import { compositionsServiceErrors } from '~/src/constants/errors';
import { CompositionInput, ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import { withTransaction } from '~/src/infrastructure/repositories/helpers';
import { CreateCompositionInput, UpdateCompositionInput } from '~/types/graphql/generated/graphql';

type CreateCompositionArgs = { input: CreateCompositionInput };
type UpdateCompositionArgs = { id: string; input: UpdateCompositionInput };

const assertAuthenticated = (context: GraphQLContext): void => {
  if (!context.admin) {
    throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
      extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
    });
  }
};

async function findExistingComposition(repo: ICompositionRepository, id: string): Promise<Composition> {
  const existing = await repo.findById(id);
  if (!existing) {
    throw new GraphQLError(compositionsServiceErrors?.COMPOSITION_NOT_FOUND?.(id), {
      extensions: { code: 'COMPOSITION_NOT_FOUND' }
    });
  }
  return existing;
}

const mapCompositionName = (name: CreateCompositionInput['name']): CompositionInput['name'] => ({
  uk: normalizeCompositionName(name.uk),
  en: normalizeCompositionName(name.en)
});

const mapCompositionInput = (input: CreateCompositionInput): CompositionInput => ({
  name: mapCompositionName(input.name),
  year: input.year ?? null,
  genre: input.genre ?? null,
  audioAvailable: (input.audios ?? []).some((audio) => Boolean(audio.url?.trim())),
  sheetAvailable: (input.sheetMusic ?? []).some((sheet) => Boolean(sheet.url?.trim())),
  sheetMusic: input.sheetMusic ?? [],
  audios: input.audios ?? [],
});

export const CompositionsMutation = {
  createComposition: async (
    _: unknown,
    { input }: CreateCompositionArgs,
    context: GraphQLContext
  ): Promise<Composition> => {
    assertAuthenticated(context);

    const { compositionsRepository: repo, opusRepository: opusRepo, assetsRepository } = context.requestContainer.cradle;

    await assertCompositionNameNotTaken(repo, input.name.uk);
    assertCompositionGenreValid(input.genre);
    assertCompositionYearValid(input.year);

    const compositionData = mapCompositionInput(input);
    const fileNames = await resolveSheetMusicFileNames(
      compositionData.sheetMusic?.map((sheet) => sheet.url) ?? [],
      assetsRepository
    );
    compositionData.sheetMusic = compositionData.sheetMusic?.map((sheet) => ({
      ...sheet,
      fileName: sheet.url ? fileNames.get(sheet.url) : undefined
    }));

    const composition = await withTransaction(async (session) => {
      let composition: Composition;
      try {
        composition = await repo.create(compositionData, session);
      } catch (error) {
        throwIfCompositionNameDuplicateKey(error, compositionData.name.uk);
        throw error;
      }
      if (!composition) {
        throw new Error(compositionsServiceErrors.COMPOSITION_NOT_CREATED);
      }


      await opusRepo.moveCompositionsToCompositionsOpus([composition.id], session);

      return composition;
    });

    await syncCompositionMediaUsageRefs(composition.id, null, composition, assetsRepository);

    return composition;
  },

  updateComposition: async (_: unknown, { id, input }: UpdateCompositionArgs, context: GraphQLContext): Promise<Composition> => {
    assertAuthenticated(context);
    const { compositionsRepository: repo, assetsRepository } = context.requestContainer.cradle;

    const existingComposition = await findExistingComposition(repo, id);
    if (input.name != null) {
      await assertCompositionNameNotTaken(repo, input.name.uk, id);
    }
    assertCompositionGenreValid(input.genre);
    assertCompositionYearValid(input.year);

    const updateData: CompositionInput = {
      ...(input.name && { name: mapCompositionName(input.name) }),
      ...(input.year !== undefined && { year: input.year ?? null }),
      ...(input.genre !== undefined && { genre: input.genre }),
      ...(input.audios !== undefined && {
        audioAvailable: (input.audios ?? []).some((audio) => Boolean(audio.url?.trim()))
      }),
      ...(input.sheetMusic !== undefined && {
        sheetAvailable: input.sheetMusic?.some((sheet) => Boolean(sheet.url?.trim())) ?? false
      }),
      ...(input.sheetMusic !== undefined && { sheetMusic: input.sheetMusic }),
      ...(input.audios !== undefined && { audios: input.audios })
    };

    if (updateData.sheetMusic !== undefined) {
      const fileNames = await resolveSheetMusicFileNames(
        updateData.sheetMusic.map((sheet) => sheet.url),
        assetsRepository
      );
      updateData.sheetMusic = updateData.sheetMusic.map((sheet) => ({
        ...sheet,
        name: sheet.name?.trim() || null,
        fileName: sheet.url ? fileNames.get(sheet.url) : undefined
      }));
    }

    let updatedComposition: Composition | null;
    try {
      updatedComposition = await repo.update(id, updateData);
    } catch (error) {
      throwIfCompositionNameDuplicateKey(error, input.name?.uk ?? '');
      throw error;
    }

    if (!updatedComposition) {
      throw new GraphQLError(`Failed to update composition with id ${id}`, {
        extensions: { code: 'COMPOSITION_UPDATE_FAILED' }
      });
    }

    if (input.sheetMusic !== undefined || input.audios !== undefined) {
      await syncCompositionMediaUsageRefs(
        updatedComposition.id,
        existingComposition,
        updatedComposition,
        assetsRepository
      );
    }

    return updatedComposition;
  },

  deleteComposition: async (_: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.compositionsRepository;
    await findExistingComposition(repo, id);

    const opusRepo = context.requestContainer.cradle.opusRepository;

    return withTransaction(async (session) => {
      await opusRepo.removeCompositionsFromCompositionsOpus([id], session);
      return repo.delete(id, session);
    });
  }
};
