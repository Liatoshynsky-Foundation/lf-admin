import { PaginatedWorksResult, WorksFilter } from '../opusQuery';
import {
  attachCompositionsToGroups,
  mappedCompositions,
  mappedGroups,
  totalCompositions,
  totalGroups,
  totalPages,
} from './tabHandlersHelpers';
import { ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import { IOpusRepository } from '~/src/domain/repositories/opusRepository';
import { OpusNumberKind, WorksTab } from '~/types/graphql/generated/graphql';

export async function handleMixed(
  repo: IOpusRepository,
  compositionsRepo: ICompositionRepository,
  filters: WorksFilter | undefined,
  page: number,
  pageSize: number
): Promise<PaginatedWorksResult> {
  const opTotal = await totalGroups(repo, WorksTab.Op, filters);
  const sineopTotal = await totalGroups(repo, WorksTab.Sineop, filters);
  
  const composOpuses = await repo.findAll({ numberKind: OpusNumberKind.Compositions });
  const allCompositionIds = composOpuses[0]?.compositions ?? [];
  const totalWorks = await totalCompositions(
    compositionsRepo,
    allCompositionIds,
    filters
  );

  const totalItems = opTotal + sineopTotal + totalWorks;
  const offset = (page - 1) * pageSize;

  const groups = [];
  const works = [];
  let remaining = pageSize;
  let currentOffset = offset;

  if (currentOffset < opTotal && remaining > 0) {
    const take = Math.min(remaining, opTotal - currentOffset);
  
    const opGroups = await mappedGroups(repo, WorksTab.Op, filters, currentOffset, take);

    const attached = await attachCompositionsToGroups(
      opGroups,
      compositionsRepo
    );

    groups.push(...attached);
    remaining -= take;
    currentOffset = 0;
  } else {
    currentOffset -= opTotal;
  }

  if (currentOffset < sineopTotal && remaining > 0) {
    const take = Math.min(remaining, sineopTotal - currentOffset);
    
    const sineopGroups = await mappedGroups(
      repo,
      WorksTab.Sineop,
      filters,
      currentOffset,
      take
    );

    const attached = await attachCompositionsToGroups(
      sineopGroups,
      compositionsRepo
    );

    groups.push(...attached);
    remaining -= take;
    currentOffset = 0;
  } else {
    currentOffset -= sineopTotal;
  }

  if (currentOffset < totalWorks && remaining > 0) {
    const take = Math.min(remaining, totalWorks - currentOffset);
    
    const fetchedWorks = await mappedCompositions(
      compositionsRepo,
      allCompositionIds,
      currentOffset,
      take,
      filters
    );

    works.push(...fetchedWorks);
  }
  
  return {
    groups,
    works,
    total: totalItems,
    page,
    totalPages: totalPages(totalItems, pageSize),
  };
}
