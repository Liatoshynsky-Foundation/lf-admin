import { endpointRepositoryHandler, mapFilters } from '../helpers';
import { Fond } from '~/src/domain/entities/Fond';
import { FondFilters } from '~/src/domain/repositories/fondRepository';

interface FindByIdArgs { id: string };
export type FiltersGQLInput = Parameters<typeof mapFilters>[0];
interface FilterArgs {
  filters: FiltersGQLInput;
}
interface PaginatedArgs { page: number, limit: number, filters: FiltersGQLInput };

interface PaginatedResponse {
  items: Fond[]; total: number; page: number; totalPages: number
};

const endpointHandler = endpointRepositoryHandler('fondRepository');

export const FondQuery = {
  findFondById: endpointHandler<FindByIdArgs, Fond | null>(async ({ args: { id }, repo }) => repo.findById(id)),
  findAllFonds: endpointHandler<FilterArgs, Fond[]>(async ({ repo, args: { filters } }) => repo.findAll(mapFilters<FondFilters>(filters))),
  findFondsPaginated: endpointHandler<PaginatedArgs, PaginatedResponse>(async ({ args: { page, limit, filters }, repo }) => repo.findPaginated(page, limit, mapFilters<FondFilters>(filters)))
};