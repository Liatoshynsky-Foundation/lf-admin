import { act, renderHook } from '@testing-library/react';

jest.mock('~/lib/utils/safeMutate', () => ({ safeMutate: jest.fn() }));
jest.mock('~/types/graphql/generated/graphql', () => ({
  useUpsertPageDraftMutation: jest.fn(),
  usePublishPageMutation: jest.fn()
}));

import { safeMutate } from '~/lib/utils/safeMutate';
import * as graphqlModule from '~/types/graphql/generated/graphql';

const mockUseUpsert = graphqlModule.useUpsertPageDraftMutation as jest.Mock;
const mockUsePublish = graphqlModule.usePublishPageMutation as jest.Mock;
const mockSafeMutate = safeMutate as jest.Mock;

const upsertMutate = jest.fn();
const publishMutate = jest.fn();
const markSavedMock = jest.fn();

type StoreState = {
  blocks: Record<string, unknown>;
  originalBlocks?: Record<string, unknown>;
  blocksOrder: Record<string, unknown>;
  originalBlocksOrder?: Record<string, unknown>;
  saveAsDraft: (slug: string) => void;
};

let storeState: StoreState = {
  blocks: {},
  originalBlocks: {},
  blocksOrder: {},
  originalBlocksOrder: {},
  saveAsDraft: markSavedMock
};

type UseStore = (<T>(selector: (s: StoreState) => T) => T) & { getState: () => StoreState };

jest.mock('~/store', () => {
  const useStore = ((selector: (s: StoreState) => unknown) => selector(storeState)) as UseStore;
  useStore.getState = () => storeState;
  return { useStore };
});

import { useSavePageBlocks } from './UseSavePage';

beforeEach(() => {
  jest.clearAllMocks();
  mockUseUpsert.mockReturnValue([upsertMutate, { loading: false, error: null, data: null }]);
  mockUsePublish.mockReturnValue([publishMutate, { loading: false, error: null, data: null }]);

  upsertMutate.mockResolvedValue({ data: { upsertPageDraft: { id: 'draft-1' } } });
  publishMutate.mockResolvedValue({ data: { publishPage: { id: 'pub-1' } } });

  mockSafeMutate.mockImplementation(
    <TVariables, TResult>(mutate: (variables: TVariables) => Promise<TResult>, variables: TVariables) =>
      mutate(variables)
  );

  storeState = {
    blocks: { test: { A: { title: 't' } } },
    originalBlocks: {},
    blocksOrder: { test: ['A'] },
    originalBlocksOrder: {},
    saveAsDraft: markSavedMock
  };
});

it('saves draft and publishes, calling markSaved and returning published page', async () => {
  const { result } = renderHook(() => useSavePageBlocks('test'));

  await act(async () => {
    await result.current.save();
  });

  expect(upsertMutate).toHaveBeenCalledWith({
    input: { slug: 'test', blocks: { A: { title: 't' } }, blocksOrder: ['A'] }
  });

  expect(publishMutate).toHaveBeenCalledWith({
    input: { slug: 'test', blocks: { A: { title: 't' } }, blocksOrder: ['A'] }
  });

  expect(markSavedMock).toHaveBeenCalledWith('test');
});

it('throws when no page blocks found', async () => {
  storeState.blocks = {};
  const { result } = renderHook(() => useSavePageBlocks('test'));
  await expect(result.current.save()).rejects.toThrow('No page blocks found');
});

it('throws when nothing changed', async () => {
  storeState = {
    ...storeState,
    originalBlocks: { test: { A: { title: 't' } } },
    originalBlocksOrder: { test: ['A'] }
  };

  const { result } = renderHook(() => useSavePageBlocks('test'));
  await expect(result.current.save()).rejects.toThrow('Nothing to save');
});

it('throws when publish returns no published page', async () => {
  publishMutate.mockResolvedValueOnce({ data: { publishPage: null } });
  const { result } = renderHook(() => useSavePageBlocks('test'));
  await expect(result.current.save()).rejects.toThrow('Server did not return published page');
  expect(markSavedMock).not.toHaveBeenCalled();
});

it('exposes loading and error values from mutations', () => {
  mockUseUpsert.mockReturnValue([upsertMutate, { loading: true, error: null, data: null }]);
  mockUsePublish.mockReturnValue([publishMutate, { loading: false, error: 'e', data: null }]);
  const { result } = renderHook(() => useSavePageBlocks('test'));
  expect(result.current.loading).toBe(true);
  expect(result.current.error).toBe('e');
});
