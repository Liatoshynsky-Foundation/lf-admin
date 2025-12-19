import { GraphQLError } from 'graphql';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { MediaMentionEntityRaw } from '~/domain/entities/MediaMentions';

type UpdateMediaMentionInput = Partial<Omit<MediaMentionEntityRaw, 'meta'>>;

type IdArgs = { id: string };
type CreateMediaMentionArgs = { url: string };
type UpdateMediaMentionArgs = { input: UpdateMediaMentionInput } & IdArgs;

export const MediaMentionsMutation = {
  createMediaMention: async (_: unknown, { url }: CreateMediaMentionArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const { mediaMentionsService } = context.requestContainer.cradle;

    return mediaMentionsService.create(url);
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
