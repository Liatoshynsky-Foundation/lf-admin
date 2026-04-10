import { endpointRepositoryHandler, mapFilters } from '../helpers';
import {MediaMentionEntity} from '~/domain/entities/MediaMentions';
import { MediaMentionFilters } from '~/domain/repositories/mediaMentionsRepository';
import { MediaStatus } from '~/types/enums/common.enums';

interface IdArgs { id: string }
interface SlugArgs { slug: string }
interface FilterArgs { filters?: Parameters<typeof mapFilters>[0] }
interface PaginatedArgs { page: number; limit: number; filters?: FilterArgs['filters'] }
interface CountArgs { status?: string }

const endpointHandler = endpointRepositoryHandler('mediaMentionsRepository');

export const MediaMentionsQuery = {
  mediaMentionById: endpointHandler<IdArgs, MediaMentionEntity | null>(async ({ args: { id }, repo }) =>
    repo.findById(id)
  ),

  mediaMentionBySlug: endpointHandler<SlugArgs, MediaMentionEntity | null>(async ({ args: { slug }, repo }) =>
    repo.findBySlug(slug)
  ),

  allMediaMentions: endpointHandler<FilterArgs, MediaMentionEntity[]>(async ({ args: { filters }, repo }) =>
    repo.findAll(mapFilters<MediaMentionFilters>(filters))
  ),

  publishedMediaMentions: endpointHandler<FilterArgs, MediaMentionEntity[]>(async ({ args: { filters }, repo }) =>
    repo.findAll(mapFilters<MediaMentionFilters>({ ...filters, statuses: [MediaStatus.Published] }))
  ),

  paginatedMediaMentions: endpointHandler<PaginatedArgs, { items: MediaMentionEntity[]; total: number; page: number; totalPages: number }>(
    async ({ args: { page, limit, filters }, repo }) =>
      repo.findPaginated(page, limit, mapFilters<MediaMentionFilters>(filters))
  ),

  mediaMentionsCount: endpointHandler<CountArgs, number>(async ({ args: { status }, repo }) =>
    repo.count(status ? { statuses: [status as MediaStatus] } : undefined)
  )
};