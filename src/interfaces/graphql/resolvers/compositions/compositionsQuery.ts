import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import type { Composition } from '~/domain/entities/Composition';

interface CompositionByIdArgs {
  id: string;
}

const assertAuthenticated = (context: GraphQLContext): void => {
  if (!context.admin) {
    throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
      extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
    });
  }
};

export const CompositionsQuery = {
  compositionById: async (
    _: unknown,
    { id }: CompositionByIdArgs,
    context: GraphQLContext
  ): Promise<Composition | null> => {
    assertAuthenticated(context);

    const repo = context.requestContainer.cradle.compositionsRepository;
    const composition = await repo.findById(id);

    if (!composition) {
      return null;
    }

    return composition;
  }
};
