import { StateCreator } from 'zustand';

import type { BlockData, EditState } from '../types';
import { BlocksMap } from '~/types/store/pages';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export const createEditSlice: StateCreator<EditState> = (set, get) => ({
  isChanged: false,
  isInitialized: false,
  blocks: {},
  locale: 'uk',
  originalBlocks: {},

  setField: <K extends keyof BlocksMap, F extends keyof BlocksMap[K]>(
    pageId: string,
    blockId: K,
    field: F,
    value: BlocksMap[K][F]
  ) => {
    const prevPageBlocks = get().blocks[pageId] || {};
    const prevBlock = (prevPageBlocks[blockId] ?? {}) as BlocksMap[K];

    if (prevBlock[field] === value) return;

    const newBlock = {
      ...prevBlock,
      [field]: value,
      isTmp: field === 'image' && value && typeof value === 'object' && 'src' in value
    };

    set({
      blocks: {
        ...get().blocks,
        [pageId]: {
          ...prevPageBlocks,
          [blockId]: newBlock
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
    let newBlock = { ...prevBlock, ...data };

    if ('image' in data) {
      const img = data.image;
      if (img && typeof img === 'object' && 'src' in img) {
        newBlock = { ...newBlock, isTmp: true };
      }
    }

    set({
      blocks: {
        ...get().blocks,
        [pageId]: {
          ...prevPageBlocks,
          [blockId]: newBlock
        }
      },
      isChanged: isInit ? get().isChanged : true,
      isInitialized: isInit ? true : get().isInitialized
    });
  },

  setPageData: <T extends Record<string, BlockData>>(pageId: string, blocks: T, isInit = false) => {
    const prevPageBlocks = get().blocks[pageId] || {};
    const nextState: Partial<EditState> = {
      blocks: {
        ...get().blocks,
        [pageId]: {
          ...prevPageBlocks,
          ...blocks
        }
      },
      isChanged: isInit ? get().isChanged : true,
      isInitialized: isInit ? true : get().isInitialized
    };
    if (isInit) {
      nextState.originalBlocks = {
        ...get().originalBlocks,
        [pageId]: clone(blocks)
      };
    }
    set(nextState as EditState);
  },

  saveAsDraft: (_pageId: string) => {
    set({ isChanged: false });
  },

  discardChanges: (pageId: string) => {
    const original = get().originalBlocks[pageId] || {};
    set({
      blocks: {
        ...get().blocks,
        [pageId]: clone(original)
      },
      isChanged: false
    });
  },

  publishPage: (_pageId: string) => {
    set({ isChanged: false });
  },

  setLocale: (locale: 'uk' | 'en') => set({ locale })
});
