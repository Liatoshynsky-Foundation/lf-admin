import { createStore, type StoreApi } from 'zustand/vanilla';

import type { EditState } from '../types';
import { createEditSlice } from './editSlice';

type BlockKey = Parameters<EditState['setField']>[1];
type FieldKey = Parameters<EditState['setField']>[2];
type FieldValue = Parameters<EditState['setField']>[3];
type BlockDataPayload = Parameters<EditState['setFields']>[2];
type SetPageDataPayload = Parameters<EditState['setPageData']>[1];

const PAGE_ID = 'page1';
const BLOCK_ID = 'OurMission' as BlockKey;

const getBlock = (storeApi: StoreApi<EditState>, pageId: string, blockId: BlockKey) => {
  const blocks = storeApi.getState().blocks[pageId] as Record<string, Record<string, unknown>> | undefined;
  return blocks?.[blockId as string];
};

describe('editSlice', () => {
  let store: StoreApi<EditState>;

  beforeEach(() => {
    store = createStore<EditState>()(createEditSlice);
  });

  it('should initialize with default state', () => {
    const state = store.getState();
    expect(state.isChanged).toBe(false);
    expect(state.isInitialized).toBe(false);
    expect(state.blocks).toEqual({});
    expect(state.originalBlocks).toEqual({});
    expect(state.blocksOrder).toEqual({});
    expect(state.originalBlocksOrder).toEqual({});
    expect(state.locale).toBe('uk');
    expect(state.invalidFields).toEqual({});
    expect(state.isSaving).toBe(false);
  });

  describe('setFieldValidity', () => {
    const KEY = `${PAGE_ID}:${BLOCK_ID}:title`;

    it('should add a key to invalidFields when marked invalid', () => {
      store.getState().setFieldValidity(KEY, true);
      expect(store.getState().invalidFields).toEqual({ [KEY]: true });
    });

    it('should remove the key from invalidFields when marked valid again', () => {
      store.getState().setFieldValidity(KEY, true);
      store.getState().setFieldValidity(KEY, false);
      expect(store.getState().invalidFields).toEqual({});
    });

    it('should be a no-op when setting the same validity twice', () => {
      store.getState().setFieldValidity(KEY, false);
      const stateBefore = store.getState().invalidFields;

      store.getState().setFieldValidity(KEY, false);
      expect(store.getState().invalidFields).toBe(stateBefore);
    });
  });

  describe('setIsSaving', () => {
    it('should set isSaving to true', () => {
      store.getState().setIsSaving(true);
      expect(store.getState().isSaving).toBe(true);
    });

    it('should set isSaving back to false', () => {
      store.getState().setIsSaving(true);
      store.getState().setIsSaving(false);
      expect(store.getState().isSaving).toBe(false);
    });

    it('should be a no-op when setting the same value twice', () => {
      store.getState().setIsSaving(false);
      const stateBefore = store.getState();

      store.getState().setIsSaving(false);
      expect(store.getState()).toBe(stateBefore);
    });
  });

  describe('setField', () => {
    it('should set field and mark as changed', () => {
      store.getState().setField(PAGE_ID, BLOCK_ID, 'title' as FieldKey, 'New Title' as FieldValue);

      const block = getBlock(store, PAGE_ID, BLOCK_ID);
      expect(block?.title).toBe('New Title');
      expect(store.getState().isChanged).toBe(true);
    });

    it('should not update state if value is exactly the same', () => {
      store.getState().setField(PAGE_ID, BLOCK_ID, 'title' as FieldKey, 'Initial' as FieldValue);
      store.setState({ isChanged: false });

      store.getState().setField(PAGE_ID, BLOCK_ID, 'title' as FieldKey, 'Initial' as FieldValue);
      expect(store.getState().isChanged).toBe(false);
    });

    it('should handle image fields and resolve isTmp correctly', () => {
      store
        .getState()
        .setField(PAGE_ID, BLOCK_ID, 'image' as FieldKey, { isTmp: true, url: 'temp.jpg' } as unknown as FieldValue);
      expect(getBlock(store, PAGE_ID, BLOCK_ID)?.isTmp).toBe(true);

      store
        .getState()
        .setField(PAGE_ID, BLOCK_ID, 'smallImage' as FieldKey, { url: 'real.jpg' } as unknown as FieldValue);
      expect(getBlock(store, PAGE_ID, BLOCK_ID)?.isTmp).toBe(false);

      store.getState().setField(PAGE_ID, BLOCK_ID, 'photo' as FieldKey, null as unknown as FieldValue);
      expect(getBlock(store, PAGE_ID, BLOCK_ID)?.photo).toBeNull();

      store.getState().setField(PAGE_ID, BLOCK_ID, 'bigImage' as FieldKey, 'string-url' as unknown as FieldValue);
      expect(getBlock(store, PAGE_ID, BLOCK_ID)?.bigImage).toBe('string-url');
    });
  });

  describe('setFields', () => {
    it('should set multiple fields and handle isTmp logic', () => {
      const payload = {
        title: 'Title',
        image: { isTmp: true, url: 'tmp.png' }
      } as unknown as BlockDataPayload;

      store.getState().setFields(PAGE_ID, BLOCK_ID, payload);

      const block = getBlock(store, PAGE_ID, BLOCK_ID);
      expect(block?.title).toBe('Title');
      expect(block?.isTmp).toBe(true);
      expect(store.getState().isChanged).toBe(true);
    });

    it('should early return if no fields changed', () => {
      store.getState().setFields(PAGE_ID, BLOCK_ID, { title: 'Same' } as unknown as BlockDataPayload);
      store.setState({ isChanged: false });

      store.getState().setFields(PAGE_ID, BLOCK_ID, { title: 'Same' } as unknown as BlockDataPayload);
      expect(store.getState().isChanged).toBe(false);
    });

    it('should skip image logic if image is null or primitive', () => {
      store.getState().setFields(PAGE_ID, BLOCK_ID, { image: null } as unknown as BlockDataPayload);
      store.getState().setFields(PAGE_ID, BLOCK_ID, { image: 'string-img' } as unknown as BlockDataPayload);

      const block = getBlock(store, PAGE_ID, BLOCK_ID);
      expect(block?.image).toBe('string-img');
    });

    it('should resolve isTmp to false if image object does not have isTmp property', () => {
      store.getState().setFields(PAGE_ID, BLOCK_ID, { image: { url: 'real.png' } } as unknown as BlockDataPayload);
      expect(getBlock(store, PAGE_ID, BLOCK_ID)?.isTmp).toBe(false);
    });

    it('should respect isInit flag when setting fields', () => {
      store.setState({ isChanged: false, isInitialized: false });
      store.getState().setFields(PAGE_ID, BLOCK_ID, { title: 'Init Title' } as unknown as BlockDataPayload, true);

      expect(store.getState().isChanged).toBe(false);
      expect(store.getState().isInitialized).toBe(true);
    });
  });

  describe('setPageData', () => {
    it('should early return from if the page is already initialized & we pass isInit=true', () => {
      const state = store.getState();
      state.initializedPages = {
        [PAGE_ID]: true
      };
      const blocks = state.blocks;
      const blocksPayload = { [BLOCK_ID as string]: { text: 'A' } } as unknown as SetPageDataPayload;

      store.getState().setPageData(PAGE_ID, blocksPayload, [BLOCK_ID as string], true);


      const stateAfter = store.getState();
      expect(stateAfter.blocks).toStrictEqual(blocks);
    });
    it('should set blocks and order, and mark as changed if not init', () => {
      const blocksPayload = { [BLOCK_ID as string]: { text: 'A' } } as unknown as SetPageDataPayload;

      store.getState().setPageData(PAGE_ID, blocksPayload, [BLOCK_ID as string]);

      const block = getBlock(store, PAGE_ID, BLOCK_ID);
      expect(block?.text).toBe('A');
      expect(store.getState().blocksOrder[PAGE_ID]).toEqual([BLOCK_ID]);
      expect(store.getState().isChanged).toBe(true);
      expect(store.getState().originalBlocks[PAGE_ID]).toBeUndefined();
    });

    it('should set original blocks when isInit is true', () => {
      const initBlocks = { [BLOCK_ID as string]: { text: 'Initial' } } as unknown as SetPageDataPayload;
      const initOrder = [BLOCK_ID as string];

      store.getState().setPageData(PAGE_ID, initBlocks, initOrder, true);

      const state = store.getState();
      expect(state.originalBlocks[PAGE_ID]).toEqual(initBlocks);
      expect(state.originalBlocksOrder[PAGE_ID]).toEqual(initOrder);
      expect(state.isChanged).toBe(false);
      expect(state.isInitialized).toBe(true);
    });
  });

  it('should set blocks order', () => {
    store.getState().setBlocksOrder(PAGE_ID, ['block2', BLOCK_ID as string]);
    expect(store.getState().blocksOrder[PAGE_ID]).toEqual(['block2', BLOCK_ID as string]);
    expect(store.getState().isChanged).toBe(true);
  });

  it.each([
    {
      method: 'saveAsDraft' as const,
      desc: 'save as draft (reset isChanged, originalBlocks & originalBlocksOrder are updated)'
    },
    {
      method: 'publishPage' as const,
      desc: 'publish page (reset isChanged, blocks & blocksOrder are updated)'
    },
  ])('should $desc', ({ method }) => {
    store.getState().setField(PAGE_ID, BLOCK_ID, 'title' as FieldKey, 'New' as FieldValue);
    expect(store.getState().isChanged).toBe(true);

    store.getState()[method](PAGE_ID);
    expect(store.getState().isChanged).toBe(false);

    const currentBlocks = store.getState().blocks;
    const currentBlocksOrder = store.getState().blocksOrder;
    const newBlocks = store.getState().blocks[PAGE_ID];
    const newBlocksOrder = store.getState().blocksOrder[PAGE_ID];


    expect(store.getState().originalBlocks).toStrictEqual({
      ...currentBlocks,
      [PAGE_ID]: newBlocks
    });
    expect(store.getState().originalBlocksOrder).toStrictEqual({
      ...currentBlocksOrder,
      [PAGE_ID]: newBlocksOrder
    });
  });

  it('should discard changes and restore from original', () => {
    const initBlocks = { [BLOCK_ID as string]: { v: 1 } } as unknown as SetPageDataPayload;
    store.getState().setPageData(PAGE_ID, initBlocks, [BLOCK_ID as string], true);

    store.getState().setField(PAGE_ID, BLOCK_ID, 'v' as FieldKey, 2 as unknown as FieldValue);
    store.getState().setBlocksOrder(PAGE_ID, ['b2', BLOCK_ID as string]);
    expect(store.getState().isChanged).toBe(true);

    store.getState().discardChanges(PAGE_ID);

    const state = store.getState();
    expect(state.blocks[PAGE_ID]).toEqual(initBlocks);
    expect(state.blocksOrder[PAGE_ID]).toEqual([BLOCK_ID]);
    expect(state.isChanged).toBe(false);
  });

  it('should clear invalidFields for the page on discardChanges, but keep other pages untouched', () => {
    const key = `${PAGE_ID}:${BLOCK_ID}:title`;
    const otherPageKey = 'other-page:OtherBlock:title';

    store.getState().setFieldValidity(key, true);
    store.getState().setFieldValidity(otherPageKey, true);

    store.getState().discardChanges(PAGE_ID);

    expect(store.getState().invalidFields).toEqual({ [otherPageKey]: true });
  });

  it('should clear invalidFields for the page when setPageData is called with isInit=true', () => {
    const key = `${PAGE_ID}:${BLOCK_ID}:title`;
    const otherPageKey = 'other-page:OtherBlock:title';

    store.getState().setFieldValidity(key, true);
    store.getState().setFieldValidity(otherPageKey, true);

    const initBlocks = { [BLOCK_ID as string]: { v: 1 } } as unknown as SetPageDataPayload;
    store.getState().setPageData(PAGE_ID, initBlocks, [BLOCK_ID as string], true);

    expect(store.getState().invalidFields).toEqual({ [otherPageKey]: true });
  });

  it('should handle discard changes when no original data exists', () => {
    store.getState().discardChanges('empty_page');
    expect(store.getState().blocks['empty_page']).toEqual({});
    expect(store.getState().blocksOrder['empty_page']).toEqual([]);
  });

  it('should update locale', () => {
    store.getState().setLocale('en');
    expect(store.getState().locale).toBe('en');
  });
});
