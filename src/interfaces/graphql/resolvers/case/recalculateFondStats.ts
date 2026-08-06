import { Case } from '~/src/domain/entities/Case';
import { ICaseRepository } from '~/src/domain/repositories/caseRepository';
import { IFondRepository } from '~/src/domain/repositories/fondRepository';

type RecalculateFondStatsDeps = {
  caseRepository: ICaseRepository;
  fondRepository: IFondRepository;
};

/**
 * Recalculates and persists the aggregated Case statistics on a Fond document:
 * - casesCount: total number of Cases that belong to the Fond.
 * - descriptionsCount: number of unique descriptionNumber values used by those Cases.
 *
 * Must be called after every Case create/update/delete that could affect the
 * counts of the given Fond (see callers in caseMutation.ts).
 */
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
