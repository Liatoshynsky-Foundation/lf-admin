import { ApolloError } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';

import { useSavePageBlocks } from './UseSavePage';

const mutateMock = jest.fn();
const markSavedMock = jest.fn();

type StoreState = {
  blocks: Record<string, unknown>;
  isChanged: boolean;
  saveAsDraft: (slug: string) => void;
};

let storeState: StoreState;

jest.mock('~/store', () => ({
  useStore: (selector: (state: StoreState) => unknown) => selector(storeState)
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  usePublishPageMutation: () => [mutateMock, { loading: false, error: null, data: null }]
}));

describe('useSavePageBlocks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storeState = {
      blocks: { testPage: { IntroSection: { title: 'test' } } },
      isChanged: true,
      saveAsDraft: markSavedMock
    };
  });

  it('should throw if no pageBlocks', async () => {
    storeState.blocks = {};
    const { result } = renderHook(() => useSavePageBlocks('testPage'));
    await expect(result.current.save()).rejects.toThrow('No page blocks found');
  });

  it('should throw if not changed', async () => {
    storeState.isChanged = false;
    const { result } = renderHook(() => useSavePageBlocks('testPage'));
    await expect(result.current.save()).rejects.toThrow('Nothing to publish');
  });

  it('should save and return published page', async () => {
    const publishedPage = {
      id: '1',
      slug: 'testPage',
      blocks: {},
      updatedAt: new Date().toISOString(),
      __typename: 'Page'
    };
    mutateMock.mockResolvedValueOnce({ data: { publishPage: publishedPage } });

    const { result } = renderHook(() => useSavePageBlocks('testPage'));
    const res = await result.current.save();

    expect(mutateMock).toHaveBeenCalledWith({
      variables: { input: { slug: 'testPage', blocks: { IntroSection: { title: 'test' } } } }
    });
    expect(markSavedMock).toHaveBeenCalledWith('testPage');
    expect(res).toEqual(publishedPage);
  });

  it('should throw if server returns no publishPage', async () => {
    mutateMock.mockResolvedValueOnce({ data: {} });
    const { result } = renderHook(() => useSavePageBlocks('testPage'));
    await expect(result.current.save()).rejects.toThrow('Server did not return published page');
  });

  it('should throw on mutate reject', async () => {
    mutateMock.mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => useSavePageBlocks('testPage'));
    await expect(result.current.save()).rejects.toThrow('Failed to publish page');
  });

  it('should map ApolloError to meaningful message', async () => {
    const gqlErr = new GraphQLError('BAD_USER_INPUT: invalid blocks');
    const apolloErr = new ApolloError({ graphQLErrors: [gqlErr] });
    mutateMock.mockRejectedValueOnce(apolloErr);

    const { result } = renderHook(() => useSavePageBlocks('testPage'));
    await expect(result.current.save()).rejects.toThrow('BAD_USER_INPUT: invalid blocks');
  });
});
