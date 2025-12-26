import { endpointRepositoryHandler } from '../helpers';
import { MediaMentionFilters } from '~/domain/entities/MediaMentions';

const mapFilters = (filters?: MediaMentionFilters) => {
  if (!filters) return undefined;

  return {
    status: filters.status
  };
};

const endpointHandler = endpointRepositoryHandler('mediaMentionsRepository');

export const MediaMentionsQuery = {
  mediaMentionById: endpointHandler(async ({ args: { id }, repo }) => repo.findById(id)),

  mediaMentionBySlug: endpointHandler(async ({ args: { slug }, repo }) => repo.findBySlug(slug)),

  allMediaMentions: endpointHandler(async ({ args: { filters }, repo }) => repo.findAll(mapFilters(filters))),

  paginatedMediaMentions: endpointHandler(async ({ args: { page = 1, limit = 10, filters }, repo }) =>
    repo.findPaginated(page, limit, mapFilters(filters))
  ),

  mediaMentionsCount: endpointHandler(async ({ args: { status }, repo }) => repo.count(status ? { status } : undefined))
};
