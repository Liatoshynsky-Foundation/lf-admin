import { Case } from '~/src/domain/entities/Case';
import { ICaseRepository } from '~/src/domain/repositories/caseRepository';
import { IFondRepository } from '~/src/domain/repositories/fondRepository';

type RecalculateFondStatsDeps = {
  caseRepository: ICaseRepository;
  fondRepository: IFondRepository;
};

export const recalculateFondStats = async (
  fondId: Case['fondId'],
  { caseRepository, fondRepository }: RecalculateFondStatsDeps
): Promise<void> => {
  const [casesCount, descriptionsCount] = await Promise.all([
    caseRepository.count({ fondId }),
    caseRepository.countDistinctDescriptionNumbers(fondId)
  ]);

  await fondRepository.update(fondId, { casesCount, descriptionsCount });
};
