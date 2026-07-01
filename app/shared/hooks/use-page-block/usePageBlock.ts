
import { useStore } from '~/store';
import type { BlocksMap } from '~/types/store/pages';

export function usePageBlock<P extends string, K extends keyof BlocksMap>(pageId: P, blockId: K) {
  const block = useStore((state) => state.blocks?.[pageId]?.[blockId]);
  
  return {
    block
  };
}
