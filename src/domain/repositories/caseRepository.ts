import { Case } from '../entities/Case';
import { FiltersInput, IBaseRepository } from './baseRepository';

export type CaseFilters = Omit<FiltersInput, 'slug'> & {
  fundId?: string;
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
