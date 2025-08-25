import { useEffect } from 'react';

import { useStore } from '~/store';
import { useGetPageQuery } from '~/types/graphql/generated/graphql';

export function usePageBlocks(pageId: string) {
  const { data, loading, error } = useGetPageQuery({
    variables: { slug: pageId }
  });

  const { setPageData, blocks } = useStore();

  useEffect(() => {
    if (data?.pageBlocks?.blocks) {
      setPageData(pageId, data.pageBlocks.blocks, true);
    }
  }, [data, setPageData, pageId]);

  return {
    loading,
    error,
    blocks: blocks[pageId] ?? {}
  };
}
