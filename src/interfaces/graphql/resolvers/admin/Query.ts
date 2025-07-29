import { GraphQLError } from 'graphql';

import { GraphQLContext } from '~/back-shared/types/container/types';

export const Query = {
  test: async (_: unknown, __: unknown, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError('You must be logged in to access this resource.', {
        extensions: {
          code: 'UNAUTHENTICATED'
        }
      });
    }
    return { __typename: 'RefreshTokenPayload', success: true };
  }
};
