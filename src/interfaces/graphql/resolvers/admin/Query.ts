import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';

type PageBlocksArgs = { slug: string; status?: 'draft' | 'published' };

export const Query = {
  pageBlocks: async (_: unknown, { slug, status = 'published' }: PageBlocksArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }
    const { pageService } = context.requestContainer.cradle;
    const page = await pageService.getPageByStatus(slug, status);
    if (!page) {
      throw new GraphQLError('Page not found', { extensions: { code: 'NOT_FOUND' } });
    }
    return page;
  }
};
