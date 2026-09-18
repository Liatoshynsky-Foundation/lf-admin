import { ResearchWork } from '../entities/ResearchWork';
import { FiltersInput, IBaseRepository } from './baseRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type ResearchWorkFilters = Omit<FiltersInput, 'slug'> & {
  statuses?: BaseContentStatuses[];
};

export type CreateResearchWorkInput = Omit<
  ResearchWork,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateResearchWorkInput = Partial<
  Omit<ResearchWork, 'id' | 'createdAt' | 'updatedAt'>
>;

export type IResearchWorkRepository = IBaseRepository<ResearchWork, ResearchWorkFilters> & {
  create(input: CreateResearchWorkInput): Promise<ResearchWork>;
};