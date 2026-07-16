import { Composition } from '~/src/domain/entities/Composition';
import { Opus } from '~/src/domain/entities/Opus';
import { QueryFilters } from '~/src/domain/repositories/baseRepository';
import { CompositionFilters, ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import { IOpusRepository, OpusFilters } from '~/src/domain/repositories/opusRepository';
import { OpusNumberKind, WorksTab } from '~/types/graphql/generated/graphql';

export const mappedGroups = async (repo: IOpusRepository, compositionsRepo: ICompositionRepository, filters: QueryFilters<OpusFilters>) => {
  const total = await repo.count(filters);

  let groups: Opus[] = await repo.findAll(filters
  );

  const opusIds = groups.map((o) => o.id);
  const allCompositions: Composition[] = await compositionsRepo.findByOpusIds(opusIds);

  const compositionsByOpusId = new Map<string, typeof allCompositions>();
  
  for (const comp of allCompositions) {
    if (comp.opusId) {
	  const idStr = String(comp.opusId);
	  if (!compositionsByOpusId.has(idStr)) {
        compositionsByOpusId.set(idStr, []);
	  }
	  compositionsByOpusId.get(idStr)!.push(comp);
    }
  }

  groups = groups.map((group) => ({
    ...group,
    compositions: compositionsByOpusId.get(String(group.id)) ?? []
  }));
	  
  return { groups, total};
};

export const mappedCompositions = async (repo: ICompositionRepository, filters: QueryFilters<CompositionFilters> & { opusId?: string | null }) => {
  const total = await repo.count(filters);
  const works = await repo.findAll(filters);

  return { works, total };
};

export const numberKindByTab: Partial<Record<WorksTab, OpusNumberKind>> = {
  [WorksTab.Opus]: OpusNumberKind.Op,
  [WorksTab.Woo]: OpusNumberKind.Woo,
};

export const totalPages = (totalItems: number, pageSize: number) => Math.ceil(totalItems / pageSize);
