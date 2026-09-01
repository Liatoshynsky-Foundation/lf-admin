import { Case } from '../entities/Case';
import { FiltersInput, IBaseRepository } from './baseRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type CaseFilters = Omit<FiltersInput, 'slug'> & {
  fundId?: string;
  statuses?: BaseContentStatuses[];
};

export type CreateCaseInput = Omit<Case, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateCaseInput = Partial<Omit<Case, 'id' | 'createdAt' | 'updatedAt'>>;

export type ICaseRepository = IBaseRepository<Case, CaseFilters> & {
  create(input: CreateCaseInput): Promise<Case>;
  findByFundAndNumbers(
    fundId: Case['fundId'],
    descriptionNumber: Case['descriptionNumber'],
    caseNumber: Case['caseNumber']
  ): Promise<Case | null>;
  countDistinctDescriptionNumbers(fundId: Case['fundId']): Promise<number>;
};
