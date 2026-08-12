'use client';

import { BaseContentStatuses } from '~/types/enums/common.enums';
import { FondFiltersInput,useAllFondsQuery } from '~/types/graphql/generated/graphql';

export function useAllFonds(filters?: FondFiltersInput | null) {
  const { data, loading, error } = useAllFondsQuery({
    variables: { filters },
    fetchPolicy: 'network-only'
  });

  const fonds = (data?.findAllFonds ?? []).map((f) => ({
    id: f.id,
    fondNumber: f.fondNumber,
    name: f.name.uk,
    descriptions: f.descriptionsCount,
    cases: f.casesCount,
    dates: f.chronologicalBoundaries?.uk ?? f.documentCreationDate.uk,
    status: f.status as unknown as BaseContentStatuses, 
    updatedAt: f.updatedAt
  }));

  return { fonds, loading, error };
}