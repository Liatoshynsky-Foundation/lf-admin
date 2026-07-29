import { endpointRepositoryHandler } from '../helpers';
import { Fond } from '~/src/domain/entities/Fond';
import { FiltersInput } from '~/src/domain/repositories/baseRepository';

interface FindByIdArgs { id: string };
interface FindBySlugArgs { slug: string };
type FiltersArgs = FiltersInput;
interface PaginatedArgs { page: number, limit: number, filters?: FiltersArgs };

interface PaginatedReponse {
    items: Fond[]; total: number; page: number; totalPages: number
};

const endpointHandler = endpointRepositoryHandler('fondRepository');

export const FondQuery = {
  findById: endpointHandler<FindByIdArgs, Fond | null>(async ({ args: { id }, repo }) => repo.findById(id)),
  findBySlug: endpointHandler<FindBySlugArgs, Fond | null>(async ({ args: { slug }, repo }) => repo.findBySlug(slug)),
  findAll: endpointHandler<FiltersArgs, Fond[]>(async ({ repo }) => repo.findAll()),
  findPaginated: endpointHandler<PaginatedArgs, PaginatedReponse>(async ({ args: { page, limit, filters }, repo }) => repo.findPaginated(page, limit, filters))
};