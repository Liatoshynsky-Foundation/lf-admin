import {endpointRepositoryHandler, mapFilters} from '../helpers';
import { NewsFilters } from '~/domain/repositories/newsRepository';
import {NewsStatus} from '~/types/enums/common.enums';

const endpointHandler = endpointRepositoryHandler('newsRepository');

export const NewsQuery = {
  newsById: endpointHandler(async ({args: {id}, repo}) => repo.findById(id)),

  newsBySlug: endpointHandler(async ({args: {slug}, repo}) => repo.findBySlug(slug)),

  allNews: endpointHandler(async ({args: {filters}, repo}) =>
    repo.findAll(mapFilters<NewsFilters>(filters))
  ),

  paginatedNews: endpointHandler(async ({args: {page, limit, filters}, repo}) =>
    repo.findPaginated(page, limit, mapFilters<NewsFilters>(filters))
  ),

  publishedNews: endpointHandler(async ({args: {filters}, repo}) =>
    repo.findAll(mapFilters<NewsFilters>({...filters, status: NewsStatus.Published}))
  ),

  draftNews: endpointHandler(async ({args: {filters}, repo}) =>
    repo.findAll(mapFilters<NewsFilters>({...filters, status: NewsStatus.Draft}))
  ),

  newsCount: endpointHandler(async ({args: {status}, repo}) =>
    repo.count(status ? {status: status as NewsStatus} : undefined)
  )
};