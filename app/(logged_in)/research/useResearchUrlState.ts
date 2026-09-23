'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { RESEARCH_WORK_ID_PARAM } from '~/constants/research';
import { useResearchWorkById } from '~/shared/hooks/use-research-works/useResearchWorks';

export function useResearchUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const workIdFromUrl = searchParams.get(RESEARCH_WORK_ID_PARAM);
  const { work: workFromUrl, loading: isLoadingFromUrl } = useResearchWorkById(workIdFromUrl);

  const setWorkIdInUrl = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) {
        params.set(RESEARCH_WORK_ID_PARAM, id);
      } else {
        params.delete(RESEARCH_WORK_ID_PARAM);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return { workIdFromUrl, workFromUrl, isLoadingFromUrl, setWorkIdInUrl };
}