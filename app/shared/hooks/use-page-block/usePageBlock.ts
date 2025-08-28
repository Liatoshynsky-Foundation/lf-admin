import { useEffect } from 'react';

import { useStore } from '~/store';
import { useGetPageQuery } from '~/types/graphql/generated/graphql';
import type { BlocksMap } from '~/types/store/pages';

export function usePageBlock<P extends string, K extends keyof BlocksMap>(pageId: P, blockId: K) {
  const { data, loading, error } = useGetPageQuery({
    variables: { slug: pageId }
  });

  const setPageData = useStore((state) => state.setPageData);

  const block = useStore((state) => state.blocks?.[pageId]?.[blockId]);

  useEffect(() => {
    if (data?.pageBlocks?.blocks) {
      setPageData(pageId, data.pageBlocks.blocks, true);
    }
  }, [data, setPageData, pageId]);

  return {
    loading,
    error,
    block
  };
}
