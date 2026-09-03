'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { COMPOSITION_MODAL_PARAM } from '~/constants/creativity';
import { createCompositionId } from '~/shared/hooks/use-upsert-opus/useUpsertOpus';
import {
  CompositionByIdQuery,
  useCompositionByIdQuery
} from '~/types/graphql/generated/graphql';
import type { OpusCompositionData } from '~/types/opus';

type CompositionFetchedData = NonNullable<CompositionByIdQuery['compositionById']>;

const mapFetchedCompositionToForm = (
  composition?: CompositionFetchedData | null
): OpusCompositionData | null => {
  if (!composition) {
    return null;
  }

  return {
    id: composition.id,
    name: composition.name?.uk ?? composition.name?.en ?? '',
    genre: composition.genre ?? '',
    year: composition.year == null ? '' : String(composition.year),
    audios: (composition.audios ?? []).map((audio) => ({
	  id: createCompositionId(),
	  name: audio.name,
	  fileUrl: audio.url
    })),
    notes: (composition.sheetMusic ?? []).map((sheet) => ({
	  id: createCompositionId(),
	  name: sheet.name ?? '',
	  fileUrl: sheet.url ?? undefined,
	  fileName: sheet.fileName ?? undefined,
	  publishDate: sheet.publishDate ?? ''
    }))
  };
};

export function useWorkUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const compositionId = searchParams.get(COMPOSITION_MODAL_PARAM);

  const { data: compositionData, loading: isCompositionLoading } = useCompositionByIdQuery({
    variables: { id: compositionId ?? '' },
    skip: !compositionId,
    fetchPolicy: 'network-only'
  });

  const compositionToEdit = useMemo(
    () => mapFetchedCompositionToForm(compositionData?.compositionById),
    [compositionData?.compositionById]
  );

  const updateUrlParam = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) {
        params.set(COMPOSITION_MODAL_PARAM, id);
      } else {
        params.delete(COMPOSITION_MODAL_PARAM);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );
  
  return {
    compositionId,
    compositionToEdit,
    isCompositionLoading,
    isEditOpen: Boolean(compositionId && compositionToEdit),
    openEditComposition: (id: string) => updateUrlParam(id),
    closeEditComposition: () => updateUrlParam(null)
  };
}
