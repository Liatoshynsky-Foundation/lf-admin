import { endpointRepositoryHandler } from '../helpers';
import { Fond } from '~/src/domain/entities/Fond';
import { FiltersInput } from '~/src/domain/repositories/baseRepository';

interface FindByIdArgs { id: string };
type FiltersArgs = FiltersInput;
interface PaginatedArgs { page: number, limit: number, filters?: FiltersArgs };

interface PaginatedResponse {
  items: Fond[]; total: number; page: number; totalPages: number
};

const endpointHandler = endpointRepositoryHandler('fondRepository');

export const FondQuery = {
  findFondById: endpointHandler<FindByIdArgs, Fond | null>(async ({ args: { id }, repo }) => repo.findById(id)),
  findAllFonds: endpointHandler<FiltersArgs, Fond[]>(async ({ repo }) => repo.findAll()),
  findFondsPaginated: endpointHandler<PaginatedArgs, PaginatedResponse>(async ({ args: { page, limit, filters }, repo }) => repo.findPaginated(page, limit, filters))
};