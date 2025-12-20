import { GraphQLError } from 'graphql';

import { endpointRepositoryHandler } from '../helpers';
import { MediaMentionsServiceErrors } from '~/back-constants/errors';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { generateUniqueSlug } from '~/back-shared/utils';
import { graphqlErrors } from '~/constants/errors';
import { parseMediaMention } from '~/lib/parser/mediaMentionsParser';

type CreateMediaMentionArgs = { url: string };

const enpointHandler = endpointRepositoryHandler('mediaMentionsRepository');

export const MediaMentionsMutation = {
  createMediaMention: async (
    _: unknown,
    { url }: CreateMediaMentionArgs,
    { requestContainer, admin }: GraphQLContext
  ) => {
    if (!admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const repo = requestContainer.cradle.mediaMentionsRepository;

    const entity = await parseMediaMention(url);
    if (!entity) {
      throw new GraphQLError(MediaMentionsServiceErrors.INVALID_URL.Error());
    }

    let slug;
    try {
      slug = await generateUniqueSlug(entity.title, {
        checkExists: async (slug: string) => !!(await repo.findBySlug(slug))
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new GraphQLError(`Failed to generate unique slug ${error.toString()}`);
      }
      throw new GraphQLError('Failed to generate unique slug due to unknown error');
    }

    return repo.create({
      ...entity,
      slug
    });
  },

  updateMediaMention: enpointHandler(async ({ args: { id, input }, repo }) => repo.update(id, input)),

  addMediaMentionView: enpointHandler(async ({ args: { id }, repo }) => repo.addView(id)),

  deleteMediaMention: enpointHandler(async ({ args: { id }, repo }) => repo.delete(id))
};
