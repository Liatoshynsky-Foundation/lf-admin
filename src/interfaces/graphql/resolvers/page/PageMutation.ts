import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import type { Page, Scalars } from '~/types/graphql/generated/graphql';

type UpsertPageDraftArgs = { input: { slug: string; blocks: Scalars['JSON']['input'] } };
type PublishPageArgs = { input: { slug: string; blocks?: Scalars['JSON']['input'] } };

export const PageMutation = {
  async upsertPageDraft(_: unknown, { input }: UpsertPageDraftArgs, context: GraphQLContext): Promise<Page> {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }
    if (input.blocks == null) {
      throw new GraphQLError(graphqlErrors.DRAFT_BLOCKS_REQUIRED.message, {
        extensions: { code: graphqlErrors.DRAFT_BLOCKS_REQUIRED.code }
      });
    }
    const { pageService } = context.requestContainer.cradle;
    return pageService.upsertDraft(input);
  },

  async publishPage(_: unknown, { input }: PublishPageArgs, context: GraphQLContext): Promise<Page> {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }
    const { pageService } = context.requestContainer.cradle;
    return pageService.publishPage(input);
  }
};
