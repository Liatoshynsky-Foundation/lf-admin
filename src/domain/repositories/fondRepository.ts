import { Fond } from '../entities/Fond';
import { FiltersInput, IBaseRepository } from './baseRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type FondFilters = Omit<FiltersInput, 'slug'> & {
  statuses?: BaseContentStatuses[];
}

export type CreateFondInput = Omit<Fond, 'id' | 'createdAt' | 'updatedAt' | 'casesCount' | 'descriptionsCount'>

export type UpdateFondInput = Partial<Omit<Fond, 'id' | 'createdAt' | 'updatedAt' | 'casesCount' | 'descriptionsCount'>>

export type IFondRepository = IBaseRepository<Fond, FondFilters> & {
    create(input: CreateFondInput): Promise<Fond>;
    findByFondNumber(fondNumber: Fond['fondNumber']): Promise<Fond | null>;
    findByIds(ids: readonly string[]): Promise<Fond[]>;
}