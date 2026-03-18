import { GraphQLError } from 'graphql';

import {endpointRepositoryHandler, extractTitleForSlug, processSlugUpdate} from '../helpers';
import { MediaMentionsServiceErrors } from '~/back-constants/errors';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { LocalizedBoolean, LocalizedImage, LocalizedString } from '~/domain/entities/BaseContent';
import { MediaMentionEntity } from '~/domain/entities/MediaMentions';
import {
  CreateMediaMentionInput,
  UpdateMediaMentionInput
} from '~/domain/repositories/mediaMentionsRepository';
import { generateUniqueSlug } from '~/src/shared/utils/slugGenerator/slugGenerator';
import { MediaStatus } from '~/types/enums/common.enums';

export type CreateMediaMentionGQLInput = {
  url: string;
  adminTitle: string;
  title: LocalizedString;
  description: LocalizedString;
  keywords: LocalizedString;
  allowIndexation: LocalizedBoolean;
  coverImage: LocalizedImage;
  status?: MediaStatus;
  publishedAt?: string;
};

export type UpdateMediaMentionGQLInput = Partial<CreateMediaMentionGQLInput> & {
  slug?: string;
};

type CreateMediaMentionArgs = { input: CreateMediaMentionGQLInput };
type UpdateMediaMentionArgs = { id: string; input: UpdateMediaMentionGQLInput };

interface IdArgs { id: string }

const endpointHandler = endpointRepositoryHandler('mediaMentionsRepository');

export const MediaMentionsMutation = {
  createMediaMention: async (
    _: unknown,
    { input }: CreateMediaMentionArgs,
    context: GraphQLContext
  ): Promise<MediaMentionEntity> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const repo = context.requestContainer.cradle.mediaMentionsRepository;
    const titleForSlug = extractTitleForSlug(input.title);

    if (!titleForSlug) {
      throw new Error('Title is required for slug generation');
    }

    const slug = await generateUniqueSlug(titleForSlug, {
      checkExists: async (slug: string) => {
        const existing = await repo.findBySlug(slug);
        return existing !== null;
      }
    });

    const mediaData: CreateMediaMentionInput = {
      ...input,
      slug,
      status: input.status || MediaStatus.Draft,
      meta: { views: 0 }
    };

    return repo.create(mediaData);
  },

  updateMediaMention: async (
    _: unknown,
    { id, input }: UpdateMediaMentionArgs,
    context: GraphQLContext
  ): Promise<MediaMentionEntity> => {
    if (!context.admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const repo = context.requestContainer.cradle.mediaMentionsRepository;
    const updateData: UpdateMediaMentionInput = { ...input };

    if (input.title) {
      await processSlugUpdate(id, input.title, repo, updateData);
    }

    const res = await repo.update(id, updateData);
    if (!res) {
      throw new GraphQLError(MediaMentionsServiceErrors.INVALID_URL.Error());
    }

    return res;
  },

  deleteMediaMention: endpointHandler<IdArgs, boolean>(async ({ args: { id }, repo }) =>
    repo.delete(id)
  ),

  addMediaMentionView: endpointHandler<IdArgs, MediaMentionEntity | null>(async ({ args: { id }, repo }) =>
    repo.incrementViews(id)
  )
};