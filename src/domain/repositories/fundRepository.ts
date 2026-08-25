import { Fund } from '../entities/Fund';
import { FiltersInput, IBaseRepository } from './baseRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type FundFilters = Omit<FiltersInput, 'slug'> & {
  statuses?: BaseContentStatuses[];
}

export type CreateFundInput = Omit<Fund, 'id' | 'createdAt' | 'updatedAt' | 'casesCount' | 'descriptionsCount'>

export type UpdateFundInput = Partial<Omit<Fund, 'id' | 'createdAt' | 'updatedAt' | 'casesCount' | 'descriptionsCount'>>

export type IFundRepository = IBaseRepository<Fund, FundFilters> & {
    create(input: CreateFundInput): Promise<Fund>;
    findByFundNumber(fundNumber: Fund['fundNumber']): Promise<Fund | null>;
    findByIds(ids: readonly string[]): Promise<Fund[]>;
}