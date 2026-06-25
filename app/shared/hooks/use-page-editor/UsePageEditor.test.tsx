import { ApolloError } from '@apollo/client';
import { cleanup, renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';

import { usePageEditor } from './usePageEditor';

const upsertDraftMock = jest.fn();
const publishMock = jest.fn();
const markSavedMock = jest.fn();

type StoreState = {
  locale: 'uk' | 'en';
  isChanged: boolean;
  saveAsDraft: (slug: string) => void;
  blocks: Record<string, unknown>;
  originalBlocks?: Record<string, unknown>;
  blocksOrder: Record<string, unknown>;
};

let storeState: StoreState;

jest.mock('~/store', () => {
  interface UseStoreMock {
    (selector: (state: StoreState) => unknown): unknown;
    getState: () => StoreState;
  }
  const useStore: UseStoreMock = Object.assign((selector: (state: StoreState) => unknown) => selector(storeState), {
    getState: () => storeState
  });
  return { useStore };
});

jest.mock('~/types/graphql/generated/graphql', () => ({
  useUpsertPageDraftMutation: () => [upsertDraftMock, { loading: false }],
  usePublishPageMutation: () => [publishMock, { loading: false, error: null, data: null }]
}));

jest.mock('~/lib/utils/fetchPreview', () => ({
  fetchPreview: jest.fn().mockResolvedValue(undefined)
}));

import { fetchPreview } from '~/lib/utils/fetchPreview';
const fetchPreviewMock = fetchPreview as jest.MockedFunction<typeof fetchPreview>;

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe('usePageEditor', () => {
  beforeEach(() => {
    storeState = {
      locale: 'uk',
      isChanged: true,
      saveAsDraft: markSavedMock,
      blocks: { test: { IntroSection: { title: 't' } } },
      originalBlocks: { test: { IntroSection: { title: 'old' } } },
      blocksOrder: { test: ['IntroSection'] }
    };
  });

  describe('preview', () => {
    it('should throw if no page blocks', async () => {
      storeState.blocks = {};
      const { result } = renderHook(() => usePageEditor('test'));
      await expect(result.current.preview()).rejects.toThrow('No page blocks found');
    });

    it('should throw if draft id is missing', async () => {
      upsertDraftMock.mockResolvedValueOnce({ data: { upsertPageDraft: { id: undefined } } });
      const { result } = renderHook(() => usePageEditor('test'));
      await expect(result.current.preview()).rejects.toThrow('Draft ID is missing');
    });

    it('should upsert draft and call fetchPreview', async () => {
      upsertDraftMock.mockResolvedValueOnce({ data: { upsertPageDraft: { id: '123' } } });
      const { result } = renderHook(() => usePageEditor('test'));
      await result.current.preview();
      expect(upsertDraftMock).toHaveBeenCalledWith({
        variables: { input: { slug: 'test', blocks: { IntroSection: { title: 't' } }, blocksOrder: ['IntroSection'] } }
      });
      expect(fetchPreviewMock).toHaveBeenCalledWith({ slug: 'test', lang: 'uk', draftId: '123' });
    });
  });

  describe('publish', () => {
    it('should throw if no page blocks', async () => {
      storeState.blocks = {};
      const { result } = renderHook(() => usePageEditor('test'));
      await expect(result.current.publish()).rejects.toThrow('No page blocks found');
    });

    it('should throw if nothing to publish when unchanged', async () => {
      storeState.isChanged = false;
      storeState.originalBlocks = { test: { IntroSection: { title: 't' } } };
      const { result } = renderHook(() => usePageEditor('test'));
      await expect(result.current.publish()).rejects.toThrow('Nothing to publish');
    });

    it('should call publish mutation and mark saved', async () => {
      const published = { id: '1', slug: 'test', __typename: 'Page' };
      publishMock.mockResolvedValueOnce({ data: { publishPage: published } });
      const { result } = renderHook(() => usePageEditor('test'));
      const res = await result.current.publish();
      expect(publishMock).toHaveBeenCalledWith({
        variables: { input: { slug: 'test', blocks: { IntroSection: { title: 't' } }, blocksOrder: ['IntroSection'] } }
      });
      expect(markSavedMock).toHaveBeenCalledWith('test');
      expect(res).toEqual(published);
    });

    it('should throw if server did not return published page', async () => {
      publishMock.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => usePageEditor('test'));
      await expect(result.current.publish()).rejects.toThrow('Server did not return published page');
    });

    it('should map ApolloError to meaningful message', async () => {
      const gqlErr = new GraphQLError('BAD_USER_INPUT: invalid blocks');
      const apolloErr = new ApolloError({ graphQLErrors: [gqlErr] });
      publishMock.mockRejectedValueOnce(apolloErr);
      const { result } = renderHook(() => usePageEditor('test'));
      await expect(result.current.publish()).rejects.toThrow('BAD_USER_INPUT: invalid blocks');
    });

    it('should map generic error', async () => {
      publishMock.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => usePageEditor('test'));
      await expect(result.current.publish()).rejects.toThrow('Failed to publish page');
    });
  });
});
