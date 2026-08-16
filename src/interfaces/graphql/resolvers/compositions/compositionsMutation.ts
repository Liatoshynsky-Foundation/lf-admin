import { GraphQLError } from 'graphql';

import {
  assertCompositionGenreValid,
  assertCompositionNameNotTaken,
  normalizeCompositionName,
  throwIfCompositionNameDuplicateKey
} from './compositionNameValidation';
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
  audioAvailable: input.audioAvailable ?? false,
  sheetAvailable: input.sheetAvailable ?? false,
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

    const { compositionsRepository: repo, opusRepository: opusRepo } = context.requestContainer.cradle;

    await assertCompositionNameNotTaken(repo, input.name.uk);
    assertCompositionGenreValid(input.genre);

    const compositionData = mapCompositionInput(input);

    return withTransaction(async (session) => {
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
  },

  updateComposition: async (_: unknown, { id, input }: UpdateCompositionArgs, context: GraphQLContext): Promise<Composition> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.compositionsRepository;

    await findExistingComposition(repo, id);
    if (input.name != null) {
      await assertCompositionNameNotTaken(repo, input.name.uk, id);
    }
    assertCompositionGenreValid(input.genre);

    const updateData: CompositionInput = {
      ...(input.name && { name: mapCompositionName(input.name) }),
      ...(input.year !== undefined && { year: input.year ?? null }),
      ...(input.genre !== undefined && { genre: input.genre }),
      ...(input.audioAvailable !== undefined && { audioAvailable: input.audioAvailable }),
      ...(input.sheetAvailable !== undefined && { sheetAvailable: input.sheetAvailable }),
      ...(input.sheetMusic !== undefined && { sheetMusic: input.sheetMusic }),
      ...(input.audios !== undefined && { audios: input.audios })
    };

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
