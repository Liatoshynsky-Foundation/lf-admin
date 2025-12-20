import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { PageStatus } from '~/types/enums/common.enums';

type PageBlocksArgs = { slug: string; status?: PageStatus };

export const Query = {
  pageBlocks: async (_: unknown, { slug, status = PageStatus.Published }: PageBlocksArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }
    const repo = context.requestContainer.cradle.pageRepository;

    const pageCallback = status === PageStatus.Draft ? repo.getDraftBySlug : repo.getPublishedBySlug;

    const page = await pageCallback(slug);
    if (!page) {
      throw new GraphQLError('Page not found', { extensions: { code: 'NOT_FOUND' } });
    }
    return page;
  }
};
