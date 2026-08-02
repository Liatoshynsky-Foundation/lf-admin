import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import type { Composition } from '~/domain/entities/Composition';
import { compositionsServiceErrors } from '~/src/constants/errors';
import { CompositionInput } from '~/src/domain/repositories/compositionRepository';
import { CreateCompositionInput } from '~/types/graphql/generated/graphql';

type CreateCompositionArgs = { input: CreateCompositionInput };

const assertAuthenticated = (context: GraphQLContext): void => {
  if (!context.admin) {
    throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
      extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
    });
  }
};

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

    const composition = await repo.create(compositionData);
    if (!composition) {
      throw new Error(compositionsServiceErrors.COMPOSITION_NOT_CREATED);
    }

    await opusRepo.moveCompositionsToCompositionsOpus([composition.id]);

    return composition;
  },
};
