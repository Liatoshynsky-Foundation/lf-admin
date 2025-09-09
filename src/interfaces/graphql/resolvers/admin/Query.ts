import { GraphQLError } from 'graphql';

import { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { PageService } from '~/domain/services/pageService';
import { PageRepository } from '~/infrastructure/repositories/pageRepository/pageRepository';

export const Query = {
  test: async (_: unknown, __: unknown, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }
    return { __typename: 'RefreshTokenPayload', success: true };
  },
  pageBlocks: async (_: unknown, args: { slug: string }, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }
    const service = PageService(PageRepository());
    const page = await service.getPage(args.slug);

    if (!page) {
      throw new GraphQLError('Page not found', { extensions: { code: 'NOT_FOUND' } });
    }

    return page;
  }
};
