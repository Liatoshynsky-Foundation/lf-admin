import { Fond } from '../entities/Fond';
import { FiltersInput, IBaseRepository } from './baseRepository';

export type FondFilters = FiltersInput

export type CreateFondInput = Omit<Fond, 'id' | 'createdAt' | 'updatedAt'>

export type IFondRepository = IBaseRepository<Fond, FondFilters> & {
    create(input: CreateFondInput): Promise<Fond>;
}