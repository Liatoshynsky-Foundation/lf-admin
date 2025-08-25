import { renderHook } from '@testing-library/react';

import { usePageBlocks } from './usePageBlocks';
import { useStore } from '~/store';
import * as graphqlHooks from '~/types/graphql/generated/graphql';

jest.mock('~/store');
jest.mock('~/types/graphql/generated/graphql');

const useStoreMock = useStore as unknown as jest.Mock;
const useGetPageQueryMock = graphqlHooks.useGetPageQuery as jest.Mock;

describe('usePageBlocks hook', () => {
  const setPageDataMock = jest.fn();
  const blocksMock = { testPage: { block1: { title: 'test' } } };

  beforeEach(() => {
    jest.clearAllMocks();
    useStoreMock.mockReturnValue({
      setPageData: setPageDataMock,
      blocks: blocksMock
    });
  });

  it('should return loading state when fetching data', () => {
    useGetPageQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined
    });

    const { result } = renderHook(() => usePageBlocks('testPage'));
    expect(result.current.loading).toBe(true);
    expect(result.current.blocks).toEqual(blocksMock['testPage']);
  });

  it('should return error if GraphQL query fails', () => {
    const error = new Error('GraphQL error');
    useGetPageQueryMock.mockReturnValue({
      data: undefined,
      loading: false,
      error
    });

    const { result } = renderHook(() => usePageBlocks('testPage'));
    expect(result.current.error).toBe(error);
    expect(result.current.loading).toBe(false);
  });

  it('should call setPageData when data is available', () => {
    const dataMock = {
      pageBlocks: { blocks: { block1: { title: 'test' } } }
    };
    useGetPageQueryMock.mockReturnValue({
      data: dataMock,
      loading: false,
      error: undefined
    });

    renderHook(() => usePageBlocks('testPage'));
    expect(setPageDataMock).toHaveBeenCalledWith('testPage', dataMock.pageBlocks.blocks, true);
  });

  it('should return empty object if no blocks for page', () => {
    useGetPageQueryMock.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined
    });

    const { result } = renderHook(() => usePageBlocks('unknownPage'));
    expect(result.current.blocks).toEqual({});
  });
});
