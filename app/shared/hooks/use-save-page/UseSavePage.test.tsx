import { cleanup, renderHook } from '@testing-library/react';

import { usePageEditor } from '~/shared/hooks/use-page-editor/usePageEditor';

const upsertMock = jest.fn();
const publishMock = jest.fn();
const fetchPreviewMock = jest.fn().mockResolvedValue(undefined);
const markSavedMock = jest.fn();

type StoreState = {
  blocks: Record<string, unknown>;
  originalBlocks?: Record<string, unknown>;
  locale: 'uk' | 'en';
  isChanged?: boolean;
  saveAsDraft: (slug: string) => void;
};

let storeState: StoreState;

type UseStore = (<T>(selector: (s: StoreState) => T) => T) & { getState: () => StoreState };

jest.mock('~/lib/utils/fetchPreview', () => ({
  fetchPreview: (...args: unknown[]) => fetchPreviewMock(...args)
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  useUpsertPageDraftMutation: () => [upsertMock, { loading: false, error: null, data: null }],
  usePublishPageMutation: () => [publishMock, { loading: false, error: null, data: null }]
}));

jest.mock('~/store', () => {
  const useStore: UseStore = ((selector: (s: StoreState) => unknown) => selector(storeState)) as UseStore;
  useStore.getState = () => storeState;
  return { useStore };
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe('usePageEditor › preview', () => {
  beforeEach(() => {
    storeState = {
      blocks: { test: { IntroSection: { title: 't' } } },
      originalBlocks: {},
      locale: 'uk',
      saveAsDraft: markSavedMock
    };
  });

  it('should upsert draft and call fetchPreview', async () => {
    upsertMock.mockResolvedValueOnce({ data: { upsertPageDraft: { id: '123' } } });

    const { result } = renderHook(() => usePageEditor('test'));
    await result.current.preview();

    expect(upsertMock).toHaveBeenCalledWith({
      variables: { input: { slug: 'test', blocks: { IntroSection: { title: 't' } } } }
    });
    expect(fetchPreviewMock).toHaveBeenCalledWith({ slug: 'test', lang: 'uk', draftId: '123' });
  });

  it('should throw if no page blocks', async () => {
    storeState.blocks = {};
    const { result } = renderHook(() => usePageEditor('test'));
    await expect(result.current.preview()).rejects.toThrow('No page blocks found');
  });

  it('should throw if draft id is missing', async () => {
    upsertMock.mockResolvedValueOnce({ data: { upsertPageDraft: null } });
    const { result } = renderHook(() => usePageEditor('test'));
    await expect(result.current.preview()).rejects.toThrow('Draft ID is missing');
    expect(fetchPreviewMock).not.toHaveBeenCalled();
  });

  it('should propagate upsert error message', async () => {
    upsertMock.mockRejectedValueOnce(new Error('Failed to create draft'));
    const { result } = renderHook(() => usePageEditor('test'));
    await expect(result.current.preview()).rejects.toThrow('Failed to create draft');
    expect(fetchPreviewMock).not.toHaveBeenCalled();
  });

  it('should propagate fetchPreview error message', async () => {
    upsertMock.mockResolvedValueOnce({ data: { upsertPageDraft: { id: '123' } } });
    fetchPreviewMock.mockRejectedValueOnce(new Error('preview boom'));
    const { result } = renderHook(() => usePageEditor('test'));
    await expect(result.current.preview()).rejects.toThrow('preview boom');
  });
});
