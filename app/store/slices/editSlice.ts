import { StateCreator } from 'zustand';

import type { BlockData, EditState } from '../types';
import { BlocksMap } from '~/types/store/pages';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

const IMAGE_FIELDS = new Set(['image', 'smallImage', 'bigImage', 'photo']);

const clearInvalidFieldsForPage = (invalidFields: Record<string, boolean>, pageId: string): Record<string, boolean> => {
  const prefix = `${pageId}:`;
  return Object.fromEntries(Object.entries(invalidFields).filter(([key]) => !key.startsWith(prefix)));
};

const resolveIsTmp = (field: string, value: unknown): boolean | undefined => {
  if (!IMAGE_FIELDS.has(field)) return undefined;
  if (!value || typeof value !== 'object') return undefined;

  const img = value as Record<string, unknown>;

  if ('isTmp' in img) return Boolean(img.isTmp);

  return false;
};

export const createEditSlice: StateCreator<EditState> = (set, get) => ({
  isChanged: false,
  isInitialized: false,
  initializedPages: {},

  invalidFields: {},
  setFieldValidity: (key: string, isInvalid: boolean) => {
    const current = get().invalidFields;
    if (Boolean(current[key]) === isInvalid) return;

    const next = { ...current };
    if (isInvalid) {
      next[key] = true;
    } else {
      delete next[key];
    }
    set({ invalidFields: next });
  },

  isSaving: false,
  setIsSaving: (isSaving: boolean) => {
    if (get().isSaving === isSaving) return;
    set({ isSaving });
  },

  blocks: {},
  originalBlocks: {},

  blocksOrder: {},
  originalBlocksOrder: {},
  locale: 'uk',

  setField: <K extends keyof BlocksMap, F extends keyof BlocksMap[K]>(
    pageId: string,
    blockId: K,
    field: F,
    value: BlocksMap[K][F]
  ) => {
    const prevPageBlocks = get().blocks[pageId] || {};
    const prevBlock = (prevPageBlocks[blockId] ?? {}) as BlocksMap[K];

    if (prevBlock[field] === value) return;

    const fieldName = field as string;
    const isTmp = resolveIsTmp(fieldName, value);

    const newBlock = {
      ...prevBlock,
      [field]: value,
      ...(isTmp === undefined ? {} : { isTmp })
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

    for (const field of IMAGE_FIELDS) {
      if (!(field in data)) continue;
      const img = (data as Record<string, unknown>)[field];
      if (!img || typeof img !== 'object') continue;

      const isTmp = 'isTmp' in img
        ? Boolean((img as Record<string, unknown>).isTmp)
        : false;

      newBlock = { ...newBlock, isTmp };
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

  setPageData: <T extends Record<string, BlockData>>(pageId: string, blocks: T, blocksOrder: string[], isInit = false) => {
    if (isInit && get().initializedPages[pageId]) {
      return;
    }

    const prevPageBlocks = get().blocks[pageId] || {};
    const nextState: Partial<EditState> = {
      blocks: {
        ...get().blocks,
        [pageId]: {
          ...prevPageBlocks,
          ...blocks
        }
      },
      blocksOrder: {
        ...get().blocksOrder,
        [pageId]: blocksOrder
      },
      isChanged: isInit ? get().isChanged : true,
      isInitialized: isInit ? true : get().isInitialized
    };
    if (isInit) {
      nextState.originalBlocks = {
        ...get().originalBlocks,
        [pageId]: clone(blocks)
      };
      nextState.originalBlocksOrder = {
        ...get().originalBlocksOrder,
        [pageId]: [...blocksOrder]
      };
      nextState.initializedPages = {
        ...get().initializedPages,
        [pageId]: true
      };
      nextState.invalidFields = clearInvalidFieldsForPage(get().invalidFields, pageId);
    }
    set(nextState as EditState);
  },

  setBlocksOrder: (pageId: string, blocksOrder: string[]) => {
    set({
      blocksOrder: {
        ...get().blocksOrder,
        [pageId]: blocksOrder
      },
      isChanged: true
    });
  },

  toggleBlockVisibility: <K extends keyof BlocksMap>(pageId: string, blockId: K) => {
    const prevPageBlocks = get().blocks[pageId] || {};
    const prevBlock = prevPageBlocks[blockId];

    if (!prevBlock) return;

    const isHidden = (prevBlock as { hidden?: boolean }).hidden;

    const newBlock = {
      ...prevBlock,
      hidden: !isHidden
    } as BlocksMap[K];

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

  saveAsDraft: (_pageId: string) => {
    const newBlocks = get().blocks[_pageId];
    const newBlocksOrder = get().blocksOrder[_pageId];

    set({
      isChanged: false,
      originalBlocks: {
        ...get().blocks,
        [_pageId]: newBlocks
      },
      originalBlocksOrder: {
        ...get().blocksOrder,
        [_pageId]: newBlocksOrder
      }
    });
  },

  discardChanges: (pageId: string) => {
    const original = get().originalBlocks[pageId] || {};
    const originalOrder = get().originalBlocksOrder[pageId] || [];
    const { [pageId]: _removed, ...remainingInitialized } = get().initializedPages;
    set({
      blocks: {
        ...get().blocks,
        [pageId]: clone(original)
      },
      blocksOrder: {
        ...get().blocksOrder,
        [pageId]: [...originalOrder]
      },
      initializedPages: remainingInitialized,
      invalidFields: clearInvalidFieldsForPage(get().invalidFields, pageId),
      isChanged: false
    });
  },

  publishPage: (_pageId: string) => {
    const newBlocks = get().blocks[_pageId];
    const newBlocksOrder = get().blocksOrder[_pageId];

    set({
      isChanged: false,
      originalBlocks: {
        ...get().blocks,
        [_pageId]: newBlocks
      },
      originalBlocksOrder: {
        ...get().blocksOrder,
        [_pageId]: newBlocksOrder
      }
    });
  },

  setLocale: (locale: 'uk' | 'en') => set({ locale })
});
