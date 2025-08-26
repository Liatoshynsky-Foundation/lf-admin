import { renderHook } from '@testing-library/react';

import { usePageBlock } from './usePageBlock';
import { useStore } from '~/store';
import * as graphqlHooks from '~/types/graphql/generated/graphql';

jest.mock('~/store');
jest.mock('~/types/graphql/generated/graphql');

const useStoreMock = useStore as unknown as jest.Mock;
const useGetPageQueryMock = graphqlHooks.useGetPageQuery as jest.Mock;

describe('usePageBlock hook', () => {
  const setPageDataMock = jest.fn();
  const blocksMock = { testPage: { IntroSection: { title: 'test' } } };

  type MockState = {
    blocks: typeof blocksMock;
    setPageData: typeof setPageDataMock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useStoreMock.mockImplementation((selector: (state: MockState) => unknown) =>
      selector({
        blocks: blocksMock,
        setPageData: setPageDataMock
      })
    );
  });

  it('should return loading if the request is still in progress', () => {
    useGetPageQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined
    });

    const { result } = renderHook(() => usePageBlock('testPage', 'IntroSection'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeUndefined();
    expect(result.current.block).toEqual(blocksMock.testPage.IntroSection);
  });

  it('should return error if the GraphQL request failed', () => {
    const error = new Error('GraphQL error');
    useGetPageQueryMock.mockReturnValue({
      data: undefined,
      loading: false,
      error
    });

    const { result } = renderHook(() => usePageBlock('testPage', 'IntroSection'));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(error);
    expect(result.current.block).toEqual(blocksMock.testPage.IntroSection);
  });

  it('should call setPageData when there is data', () => {
    const dataMock = {
      pageBlocks: { blocks: { IntroSection: { title: 'updated' } } }
    };

    useGetPageQueryMock.mockReturnValue({
      data: dataMock,
      loading: false,
      error: undefined
    });

    renderHook(() => usePageBlock('testPage', 'IntroSection'));

    expect(setPageDataMock).toHaveBeenCalledWith('testPage', dataMock.pageBlocks.blocks, true);
  });
});
