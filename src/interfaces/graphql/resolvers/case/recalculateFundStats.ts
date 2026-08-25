import { Case } from '~/src/domain/entities/Case';
import { ICaseRepository } from '~/src/domain/repositories/caseRepository';
import { IFundRepository } from '~/src/domain/repositories/fundRepository';

type RecalculateFundStatsDeps = {
  caseRepository: ICaseRepository;
  fundRepository: IFundRepository;
};

export const recalculateFundStats = async (
  fundId: Case['fundId'],
  { caseRepository, fundRepository }: RecalculateFundStatsDeps
): Promise<void> => {
  const [casesCount, descriptionsCount] = await Promise.all([
    caseRepository.count({ fundId }),
    caseRepository.countDistinctDescriptionNumbers(fundId)
  ]);

  await fundRepository.update(fundId, { casesCount, descriptionsCount });
};
