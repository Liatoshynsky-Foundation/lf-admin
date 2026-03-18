import { GraphQLError } from 'graphql';

import { endpointRepositoryHandler } from '../helpers';
import { MediaMentionsServiceErrors } from '~/back-constants/errors';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import parseMediaMention from '~/lib/parser/mediaMentionsParser';
import { generateUniqueSlug } from '~/src/shared/utils/slugGenerator/slugGenerator';
import { Result } from '~/types/common';

function Unwrapper<T>(result: Result<T>): T {
  if (result.ok) {
    return result.value;
  }
  throw new GraphQLError(result.error.Error());
}

const enpointHandler = endpointRepositoryHandler('mediaMentionsRepository');

export const MediaMentionsMutation = {
  createMediaMention: async (
    _: unknown,
    { input: { url } }: { input: { url: string } },
    { requestContainer, admin }: GraphQLContext
  ) => {
    if (!admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    if (!url) {
      throw new GraphQLError(MediaMentionsServiceErrors.INVALID_URL.Error());
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

    return Unwrapper(
      await repo.create({
        ...entity,
        slug,
        meta: {
          views: 0
        }
      })
    );
  },

  updateMediaMention: enpointHandler(async ({ args: { id, input }, repo }) => repo.update(id, input)),

  addMediaMentionView: enpointHandler(async ({ args: { id }, repo }) => Unwrapper(await repo.addView(id))),

  deleteMediaMention: enpointHandler(async ({ args: { id }, repo }) => repo.delete(id))
};
