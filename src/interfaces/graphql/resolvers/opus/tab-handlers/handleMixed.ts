import { PaginatedWorksResult, WorksFilter } from '../opusQuery';
import { attachCompositionsToGroups, mappedGroups, orderCompositionsByIds, totalPages } from './tabHandlersHelpers';
import { ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import { IOpusRepository } from '~/src/domain/repositories/opusRepository';
import { WorksTab } from '~/types/graphql/generated/graphql';

export async function handleMixed(
  repo: IOpusRepository,
  compositionsRepo: ICompositionRepository,
  filters: WorksFilter | undefined,
  page: number,
  pageSize: number
): Promise<PaginatedWorksResult> {
  const opResult = await mappedGroups(repo, WorksTab.Op, filters);
  const sineopResult = await mappedGroups(repo, WorksTab.Sineop, filters);
  const standaloneResult = await mappedGroups(repo, WorksTab.Compositions, filters);

  const standaloneCompositionIds = standaloneResult.groups[0]?.compositions ?? [];
  const standaloneCompositions = standaloneCompositionIds.length
    ? orderCompositionsByIds(
      standaloneCompositionIds,
      await compositionsRepo.findByIds(standaloneCompositionIds)
    )
    : [];

  const totalGroups = opResult.total + sineopResult.total;
  const totalWorks = standaloneCompositions.length;
  const totalItems = totalGroups + totalWorks;

  const offset = (page - 1) * pageSize;

  const groups = [];
  const works = [];
  let remaining = pageSize;

  if (offset < opResult.total && remaining > 0) {
    const take = Math.min(remaining, opResult.total - offset);
    const opGroups = await attachCompositionsToGroups(opResult.groups.slice(offset, offset + take), compositionsRepo);
    groups.push(...opGroups);
    remaining -= take;
  }

  const sineopOffset = Math.max(0, offset - opResult.total);
  if (remaining > 0 && sineopOffset < sineopResult.total) {
    const take = Math.min(remaining, sineopResult.total - sineopOffset);
    const sineopGroups = await attachCompositionsToGroups(
      sineopResult.groups.slice(sineopOffset, sineopOffset + take),
      compositionsRepo
    );
    groups.push(...sineopGroups);
    remaining -= take;
  }

  const worksOffset = Math.max(0, offset - totalGroups);
  if (remaining > 0 && worksOffset < totalWorks) {
    works.push(...standaloneCompositions.slice(worksOffset, worksOffset + remaining));
  }

  return {
    groups,
    works,
    total: totalItems,
    page,
    totalPages: totalPages(totalItems, pageSize)
  };
}
