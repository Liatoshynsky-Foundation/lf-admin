import {endpointRepositoryHandler, mapFilters} from '../helpers';
import { MediaMentionFilters } from '~/domain/repositories/mediaMentionsRepository';
import { MediaStatus} from '~/types/enums/common.enums';

const endpointHandler = endpointRepositoryHandler('mediaMentionsRepository');

export const MediaMentionsQuery = {
  mediaMentionById: endpointHandler(async ({ args: { id }, repo }) => repo.findById(id)),

  mediaMentionBySlug: endpointHandler(async ({ args: { slug }, repo }) => repo.findBySlug(slug)),

  allMediaMentions: endpointHandler(async ({ args: { filters }, repo }) =>
    repo.findAll(mapFilters<MediaMentionFilters>(filters))
  ),

  publishedMediaMentions: endpointHandler(async ({ args: { filters }, repo }) =>
    repo.findAll(mapFilters<MediaMentionFilters>({ ...filters, status: MediaStatus.Published }))
  ),

  paginatedMediaMentions: endpointHandler(async ({ args: { page, limit, filters }, repo }) =>
    repo.findPaginated(page, limit, mapFilters<MediaMentionFilters>(filters))
  ),

  mediaMentionsCount: endpointHandler(async ({ args: { status }, repo }) =>
    repo.count(status ? { status: status as MediaStatus } : undefined)
  )
};