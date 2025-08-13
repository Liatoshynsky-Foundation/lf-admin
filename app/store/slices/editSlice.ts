import { StateCreator } from 'zustand';

import type { BlockData, EditState } from '../types';

export const createEditSlice: StateCreator<EditState> = (set, get) => ({
  isChanged: false,
  isInitialized: false,
  blocks: {},

  setField: (pageId, blockId, field, value) => {
    const prevPageBlocks = get().blocks[pageId] || {};
    const prevBlock = (prevPageBlocks[blockId] ?? {}) as BlockData<typeof blockId>;

    if (prevBlock[field] === value) return;

    set({
      blocks: {
        ...get().blocks,
        [pageId]: {
          ...prevPageBlocks,
          [blockId]: {
            ...prevBlock,
            [field]: value
          }
        }
      },
      isChanged: true
    });
  },

  setFields: (pageId, blockId, data, isInit = false) => {
    const prevPageBlocks = get().blocks[pageId] || {};
    const prevBlock = (prevPageBlocks[blockId] ?? {}) as BlockData<typeof blockId>;

    const isDifferent = Object.entries(data).some(([key, val]) => prevBlock[key as keyof typeof data] !== val);
    if (!isDifferent) return;

    set({
      blocks: {
        ...get().blocks,
        [pageId]: {
          ...prevPageBlocks,
          [blockId]: {
            ...prevBlock,
            ...data
          }
        }
      },
      isChanged: isInit ? get().isChanged : true,
      isInitialized: isInit ? true : get().isInitialized
    });
  },
  saveAsDraft: () => {
    const content = get().blocks;
    void content;
    set({ isChanged: false });
  },
  publishPage: () => {
    const content = get().blocks;
    void content;
    set({ isChanged: false });
  }
});
