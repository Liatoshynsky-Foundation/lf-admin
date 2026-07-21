
import { mapFilters } from '../../helpers';
import { WorksFilter } from '../opusQuery';
import { Composition } from '~/domain/entities/Composition';
import { Opus } from '~/src/domain/entities/Opus';
import { ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
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
  const uniqueIds = [...new Set(groups.flatMap((group) => group.compositions ?? []))];

  if (uniqueIds.length === 0) {
    return groups.map((group) => ({ ...group, compositions: [] }));
  }

  const compositions = await compositionsRepo.findByIds(uniqueIds);

  return groups.map((group) => ({
    ...group,
    compositions: orderCompositionsByIds(group.compositions ?? [], compositions)
  }));
};

export const mappedGroups = async (
  repo: IOpusRepository,
  tab: WorksTab,
  filters: WorksFilter | undefined
) => {
  const numberKind = numberKindByTab[tab]!;

  const mappedFilters: OpusFilters = {
    ...mapFilters<OpusFilters>(filters),
    numberKind
  };
  
  const total = await repo.count(mappedFilters);
  const groups: Opus[] = await repo.findAll(mappedFilters);
  
  console.log('total:', total);
  console.log('groups:', groups);
  return { groups, total };
};

export const numberKindByTab: Partial<Record<WorksTab, OpusNumberKind>> = {
  [WorksTab.Op]: OpusNumberKind.Op,
  [WorksTab.Sineop]: OpusNumberKind.Sineop,
  [WorksTab.Compositions]: OpusNumberKind.Compositions, 
};

export const totalPages = (totalItems: number, pageSize: number) => Math.ceil(totalItems / pageSize);
