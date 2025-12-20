import { endpointRepositoryHandler } from '../helpers';
import { NewsStatus } from '~/types/enums/common.enums';

type NewsFiltersInput = {
  status?: string;
  slug?: string;
  sortBy?: string;
  sortOrder?: string;
};

const mapFilters = (filters?: NewsFiltersInput) => {
  if (!filters) return undefined;

  return {
    status: filters.status as NewsStatus | undefined,
    slug: filters.slug,
    sortBy: filters.sortBy as 'createdAt' | 'updatedAt' | 'publishedAt' | 'newsDate' | undefined,
    sortOrder: filters.sortOrder as 'asc' | 'desc' | undefined
  };
};

const endpointHandler = endpointRepositoryHandler('newsRepository');

export const NewsQuery = {
  newsById: endpointHandler(async ({ args: { id }, repo }) => repo.findById(id)),

  newsBySlug: endpointHandler(async ({ args: { slug }, repo }) => repo.findBySlug(slug)),

  allNews: endpointHandler(async ({ args: { filters }, repo }) => repo.findAll(mapFilters(filters))),

  paginatedNews: endpointHandler(async ({ args: { page = 1, limit = 10, filters }, repo }) =>
    repo.findPaginated(page, limit, mapFilters(filters))
  ),

  newsCount: endpointHandler(async ({ args: { status }, repo }) => repo.count({ status }))
};
