import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { MediaMentionEntityRaw } from '~/domain/entities/MediaMentions';

type CreateMediaMentionInput = {
  url: string;
};

type UpdateMediaMentionInput = Partial<Omit<MediaMentionEntityRaw, 'meta'>>;

type CreateMediaMentionArgs = { input: CreateMediaMentionInput };
type UpdateMediaMentionArgs = { id: string; input: UpdateMediaMentionInput };
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

  updateMediaMention: async (_: unknown, { id, input }: UpdateMediaMentionArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { mediaMentionsService } = context.requestContainer.cradle;

    return mediaMentionsService.update(id, input);
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
