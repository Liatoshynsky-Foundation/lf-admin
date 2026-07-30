import { Fond } from '../entities/Fond';
import { FiltersInput, IBaseRepository } from './baseRepository';

export type FondFilters = Omit<FiltersInput, 'slug'>

export type CreateFondInput = Omit<Fond, 'id' | 'createdAt' | 'updatedAt'>

export type UpdateFondInput = Partial<Omit<Fond, 'id' | 'createdAt' | 'updatedAt'>>

export type IFondRepository = IBaseRepository<Fond, FondFilters> & {
    create(input: CreateFondInput): Promise<Fond>;
    findByFondNumber(fondNumber: Fond['fondNumber']): Promise<Fond | null>;
}