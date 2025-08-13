import { useEffect } from 'react';

import { useStore } from '../../../store';
import { BlocksMap } from '~/types/store/pages';

function useInitBlock<P extends string, K extends keyof BlocksMap>(
  pageId: P,
  blockId: K,
  initialData: BlocksMap[K]
): BlocksMap[K] {
  const block = useStore((state) => state.blocks?.[pageId]?.[blockId]);
  const setFields = useStore((state) => state.setFields);

  useEffect(() => {
    if (!block || Object.keys(block).length === 0) {
      setFields(pageId, blockId, initialData, true);
    }
  }, [block, pageId, blockId, initialData, setFields]);

  return block ?? initialData;
}

export default useInitBlock;
