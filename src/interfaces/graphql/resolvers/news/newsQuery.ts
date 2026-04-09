import { endpointRepositoryHandler, mapFilters } from '../helpers';
import { News } from '~/domain/entities/News';
import { NewsFilters } from '~/domain/repositories/newsRepository';
import { NewsStatus } from '~/types/enums/common.enums';

interface IdArgs { id: string }
interface SlugArgs { slug: string }
interface FilterArgs { filters?: Parameters<typeof mapFilters>[0] }
interface PaginatedArgs { page: number; limit: number; filters?: FilterArgs['filters'] }
interface CountArgs { status?: string }

const endpointHandler = endpointRepositoryHandler('newsRepository');

export const NewsQuery = {
  newsById: endpointHandler<IdArgs, News | null>(async ({ args: { id }, repo }) =>
    repo.findById(id)
  ),

  newsBySlug: endpointHandler<SlugArgs, News | null>(async ({ args: { slug }, repo }) =>
    repo.findBySlug(slug)
  ),

  allNews: endpointHandler<FilterArgs, News[]>(async ({ args: { filters }, repo }) =>
    repo.findAll(mapFilters<NewsFilters>(filters))
  ),

  paginatedNews: endpointHandler<PaginatedArgs, { items: News[]; total: number; page: number; totalPages: number }>(
    async ({ args: { page, limit, filters }, repo }) =>
      repo.findPaginated(page, limit, mapFilters<NewsFilters>(filters))
  ),

  publishedNews: endpointHandler<FilterArgs, News[]>(async ({ args: { filters }, repo }) =>
    repo.findAll(mapFilters<NewsFilters>({ ...filters, statuses: [NewsStatus.Published], status: undefined }))
  ),

  draftNews: endpointHandler<FilterArgs, News[]>(async ({ args: { filters }, repo }) =>
    repo.findAll(mapFilters<NewsFilters>({ ...filters, statuses: [NewsStatus.Draft], status: undefined }))
  ),

  newsCount: endpointHandler<CountArgs, number>(async ({ args: { status }, repo }) =>
    repo.count(status ? { statuses: [status as NewsStatus] } : undefined)
  )
};