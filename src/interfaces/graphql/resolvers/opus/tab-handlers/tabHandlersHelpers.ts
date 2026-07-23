
import { mapFilters } from '../../helpers';
import { WorksFilter } from '../opusQuery';
import { Composition } from '~/domain/entities/Composition';
import { Opus } from '~/src/domain/entities/Opus';
import { CompositionFilters, ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import { IOpusRepository, OpusFilters } from '~/src/domain/repositories/opusRepository';
import { OpusNumberKind, WorksTab } from '~/types/graphql/generated/graphql';

export type OpusWithCompositions = Omit<Opus, 'compositions'> & {
  compositions: Composition[];
};

export const orderCompositionsByIds = (ids: string[], compositions: Composition[]): Composition[] => {
  const byId = new Map(compositions.map((composition) => [composition.id, composition]));

  return ids.map((id) => byId.get(id)).filter((composition): composition is Composition => composition !== undefined);
};

export const attachCompositionsToGroups = async (
  groups: Opus[],
  compositionsRepo: ICompositionRepository
): Promise<OpusWithCompositions[]> => {
  const allCompositionIds = groups.flatMap((group) => 
    (group.compositions ?? []).map((id) => id.toString())
  );
  
  const uniqueIds = [...new Set(allCompositionIds)];

  if (uniqueIds.length === 0) {
    return groups.map((group) => ({ ...group, compositions: [] }));
  }

  const compositions = await compositionsRepo.findByIds(uniqueIds);

  return groups.map((group) => {
    const groupCompIds = (group.compositions ?? []).map((id) => id.toString());
    
    return {
      ...group,
      compositions: orderCompositionsByIds(groupCompIds, compositions)
    };
  });
};

const getOpusFilters = (
  tab: WorksTab,
  filters?: WorksFilter
): OpusFilters => ({
  ...mapFilters<OpusFilters>(filters),
  numberKind: numberKindByTab[tab]!,
});

export const mappedGroups = async (
  repo: IOpusRepository,
  tab: WorksTab,
  filters?: WorksFilter,
  skip?: number,
  limit?: number
): Promise<Opus[]> => {
  const opusFilters = getOpusFilters(tab, filters);

  return await repo.findAll({
    ...opusFilters,
    skip,
    limit,
  });
};
export const totalGroups = async (
  repo: IOpusRepository,
  tab: WorksTab,
  filters?: WorksFilter
): Promise<number> => {
  const opusFilters = getOpusFilters(tab, filters);

  return await repo.count(opusFilters);
};

const getCompositionFilters = (filters?: WorksFilter): CompositionFilters => {
  return mapFilters<CompositionFilters>(filters) ?? {};
};

export const mappedCompositions = async (
  compositionRepo: ICompositionRepository,
  compositionIds: string[],
  page: number,
  pageSize: number,
  filters?: WorksFilter
) => {
  const compositionFilters = getCompositionFilters(filters);

  return await compositionRepo.findByIdsPaginated(
    compositionIds,
    {
      ...compositionFilters,
      skip: (page - 1) * pageSize,
      limit: pageSize,
    }
  );
};

export const totalCompositions = async (
  compositionRepo: ICompositionRepository,
  compositionIds: string[],
  filters?: WorksFilter
): Promise<number> => {
  const compositionFilters = getCompositionFilters(filters);

  return await compositionRepo.countByIds(
    compositionIds,
    compositionFilters
  );
};

export const numberKindByTab: Partial<Record<WorksTab, OpusNumberKind>> = {
  [WorksTab.Op]: OpusNumberKind.Op,
  [WorksTab.Sineop]: OpusNumberKind.Sineop,
  [WorksTab.Compositions]: OpusNumberKind.Compositions, 
};

export const totalPages = (totalItems: number, pageSize: number) => Math.ceil(totalItems / pageSize);
