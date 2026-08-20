import { endpointRepositoryHandler, mapFilters } from '../helpers';
import { Fund } from '~/src/domain/entities/Fund';
import { FundFilters } from '~/src/domain/repositories/fundRepository';

interface FindByIdArgs { id: string };
export type FiltersGQLInput = Parameters<typeof mapFilters>[0];
interface FilterArgs {
  filters: FiltersGQLInput;
}
interface PaginatedArgs { page: number, limit: number, filters: FiltersGQLInput };

interface PaginatedResponse {
  items: Fund[]; total: number; page: number; totalPages: number
};

const endpointHandler = endpointRepositoryHandler('fundRepository');

export const FundQuery = {
  findFundById: endpointHandler<FindByIdArgs, Fund | null>(async ({ args: { id }, repo }) => repo.findById(id)),
  findAllFunds: endpointHandler<FilterArgs, Fund[]>(async ({ repo, args: { filters } }) => repo.findAll(mapFilters<FundFilters>(filters))),
  findFundsPaginated: endpointHandler<PaginatedArgs, PaginatedResponse>(async ({ args: { page, limit, filters }, repo }) => repo.findPaginated(page, limit, mapFilters<FundFilters>(filters)))
};