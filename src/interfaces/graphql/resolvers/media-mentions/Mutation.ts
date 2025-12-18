import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';

type CreateMediaMentionInput = {
  url: string;
};

type CreateMediaMentionArgs = { input: CreateMediaMentionInput };
type IdArgs = { id: string };

export const MediaMentionsMutation = {
  createMediaMention: async (_: unknown, { input }: CreateMediaMentionArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { mediaMentionsService } = context.requestContainer.cradle;

    return mediaMentionsService.create(input.url);
  },

  publishMediaMention: async (_: unknown, { id }: IdArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { mediaMentionsService } = context.requestContainer.cradle;

    return mediaMentionsService.publish(id);
  },

  unpublishMediaMention: async (_: unknown, { id }: IdArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { mediaMentionsService } = context.requestContainer.cradle;

    return mediaMentionsService.unpublish(id);
  },

  addMediaMentionView: async (_: unknown, { id }: IdArgs, context: GraphQLContext) => {
    const { mediaMentionsService } = context.requestContainer.cradle;

    return mediaMentionsService.addView(id);
  },

  deleteMediaMention: async (_: unknown, { id }: IdArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { mediaMentionsService } = context.requestContainer.cradle;

    return mediaMentionsService.delete(id);
  }
};
