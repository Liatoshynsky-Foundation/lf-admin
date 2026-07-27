import { renderHook } from '@testing-library/react';

import { useAllAssets } from './useAssets';
import { type AssetsFiltersInput,useAllAssetsQuery } from '~/types/graphql/generated/graphql';

jest.mock('~/types/graphql/generated/graphql', () => ({
  useAllAssetsQuery: jest.fn()
}));

const mockedUseAllAssetsQuery = useAllAssetsQuery as jest.Mock;

describe('useAllAssets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call useAllAssetsQuery with correct default parameters', () => {
    mockedUseAllAssetsQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined
    });

    const { result } = renderHook(() => useAllAssets());

    expect(mockedUseAllAssetsQuery).toHaveBeenCalledWith({
      variables: { filters: undefined },
      fetchPolicy: 'network-only'
    });
    expect(result.current.loading).toBe(true);
  });

  it('should pass filters to useAllAssetsQuery when provided', () => {
    const filters: AssetsFiltersInput = {
      search: 'test-query'
    };

    mockedUseAllAssetsQuery.mockReturnValue({
      data: { allAssets: [] },
      loading: false,
      error: undefined
    });

    renderHook(() => useAllAssets(filters));

    expect(mockedUseAllAssetsQuery).toHaveBeenCalledWith({
      variables: { filters },
      fetchPolicy: 'network-only'
    });
  });

  it('should return data from useAllAssetsQuery', () => {
    const mockData = { allAssets: [{ id: '1', name: 'Asset 1' }] };
    mockedUseAllAssetsQuery.mockReturnValue({
      data: mockData,
      loading: false,
      error: undefined
    });

    const { result } = renderHook(() => useAllAssets());

    expect(result.current.data).toEqual(mockData);
  });
});
