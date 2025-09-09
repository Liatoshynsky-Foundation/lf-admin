import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { PageService } from '~/domain/services/pageService';
import { PageRepository } from '~/infrastructure/repositories/pageRepository/pageRepository';
import type { Page, Scalars } from '~/types/graphql/generated/graphql';

type UpdatePageBlocksArgs = {
  input: {
    slug: string;
    blocks: Scalars['JSON']['input'];
  };
};

export const PageMutation = {
  async updatePageBlocks(_: unknown, { input }: UpdatePageBlocksArgs, context: GraphQLContext): Promise<Page> {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const service = PageService(PageRepository());
    const updated = await service.updatePageBlocks({
      slug: input.slug,
      blocks: input.blocks
    });

    return updated;
  }
};
