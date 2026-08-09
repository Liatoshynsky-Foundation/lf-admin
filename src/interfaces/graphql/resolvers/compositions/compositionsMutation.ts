import { GraphQLError } from 'graphql';

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

const mapCompositionInput = (input: CreateCompositionInput): CompositionInput => ({
  name: input.name,
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

    const { 
      compositionsRepository: repo, 
      opusRepository: opusRepo 
    } = context.requestContainer.cradle;

    const compositionData = mapCompositionInput(input);

    return withTransaction(async (session) => {
      const composition = await repo.create(compositionData, session );
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

    const updateData: CompositionInput = {
      ...(input.name && { name: input.name }),
      ...(input.year !== undefined && { year: input.year ?? null }),
      ...(input.genre !== undefined && { genre: input.genre }),
      ...(input.audioAvailable !== undefined && { audioAvailable: input.audioAvailable }),
      ...(input.sheetAvailable !== undefined && { sheetAvailable: input.sheetAvailable }),
      ...(input.sheetMusic !== undefined && { sheetMusic: input.sheetMusic }),
      ...(input.audios !== undefined && { audios: input.audios })
    };

    const updatedComposition = await repo.update(id, updateData);

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
