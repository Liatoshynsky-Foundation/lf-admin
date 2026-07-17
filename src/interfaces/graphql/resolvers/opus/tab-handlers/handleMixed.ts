import { mapFilters } from '../../helpers';
import { PaginatedWorksResult, WorksFilter } from '../opusQuery';
import { mappedCompositions, mappedGroups, totalPages } from './tabHandlersHelpers';
import { CompositionFilters, ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import { IOpusRepository, OpusFilters } from '~/src/domain/repositories/opusRepository';
import { OpusNumberKind } from '~/types/graphql/generated/graphql';

export async function handleMixed(
  repo: IOpusRepository,
  compositionsRepo: ICompositionRepository,
  filters: WorksFilter | undefined,
  page: number,
  pageSize: number
): Promise<PaginatedWorksResult> {
  const opFilters: OpusFilters = {
    ...mapFilters<OpusFilters>(filters),
    numberKind: OpusNumberKind.Op
  };

  const wooFilters: OpusFilters = {
    ...mapFilters<OpusFilters>(filters),
    numberKind: OpusNumberKind.Woo
  };

  const compositionFilters: CompositionFilters = {
    ...mapFilters<CompositionFilters>(filters),
    opusId: null
  };

  const totalOp = await repo.count(opFilters);
  const totalWoo = await repo.count(wooFilters);
  const totalWorks = await compositionsRepo.count(compositionFilters);

  const totalGroups = totalOp + totalWoo;
  const totalItems = totalGroups + totalWorks;

  const offset = (page - 1) * pageSize;

  const groups = [];
  const works = [];

  let remaining = pageSize;

  if (offset < totalOp && remaining > 0) {
    const take = Math.min(remaining, totalOp - offset);

    const result = await mappedGroups(repo, compositionsRepo, {
      ...opFilters,
      skip: offset,
      limit: take
    });

    groups.push(...result.groups);
    remaining -= take;
  }

  const wooOffset = Math.max(0, offset - totalOp);

  if (remaining > 0 && wooOffset < totalWoo) {
    const take = Math.min(remaining, totalWoo - wooOffset);

    const result = await mappedGroups(repo, compositionsRepo, {
      ...wooFilters,
      skip: wooOffset,
      limit: take
    });

    groups.push(...result.groups);
    remaining -= take;
  }

  const worksOffset = Math.max(0, offset - totalGroups);

  if (remaining > 0) {
    const result = await mappedCompositions(compositionsRepo, {
      ...compositionFilters,
      skip: worksOffset,
      limit: remaining
    });

    works.push(...result.works);
  }

  return {
    groups,
    works,
    total: totalItems,
    page,
    totalPages: totalPages(totalItems, pageSize)
  };
}
