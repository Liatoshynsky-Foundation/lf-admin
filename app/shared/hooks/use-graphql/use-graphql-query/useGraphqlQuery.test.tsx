import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { useGraphqlQuery } from './useGraphqlQuery';
import { graphqlFetcher } from '~/hooks/use-graphql-fetcher/useGraphqlFetcher';

jest.mock('../../use-graphql-fetcher/useGraphqlFetcher', () => ({
  graphqlFetcher: jest.fn()
}));

const mockedGraphqlFetcher = graphqlFetcher as jest.Mock;

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

const createWrapper = (client: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('useGraphqlQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data successfully and update state accordingly', async () => {
    const testQueryClient = createTestQueryClient();
    const wrapper = createWrapper(testQueryClient);

    const mockQueryKey = ['user', '123'];
    const mockQuery = 'query { user(id: "123") { name } }';
    const mockVariables = { id: '123' };
    const mockResponseData = { user: { name: 'Alice' } };

    mockedGraphqlFetcher.mockResolvedValue(mockResponseData);
    const { result } = renderHook(
      () => useGraphqlQuery<typeof mockResponseData, typeof mockVariables>(mockQueryKey, mockQuery, mockVariables),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(mockResponseData);
    expect(result.current.isError).toBe(false);

    expect(mockedGraphqlFetcher).toHaveBeenCalledTimes(1);
    expect(mockedGraphqlFetcher).toHaveBeenCalledWith({
      query: mockQuery,
      variables: mockVariables
    });
  });

  it('should handle errors and update state accordingly', async () => {
    const testQueryClient = createTestQueryClient();
    const wrapper = createWrapper(testQueryClient);

    const mockQueryKey = ['posts'];
    const mockError = new Error('Network Error');

    mockedGraphqlFetcher.mockRejectedValue(mockError);

    const { result } = renderHook(() => useGraphqlQuery(mockQueryKey, 'query { posts }'), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
  });

  it('should not fetch data automatically if options.enabled is false', async () => {
    const testQueryClient = createTestQueryClient();
    const wrapper = createWrapper(testQueryClient);

    const mockQueryKey = ['settings'];
    const mockQuery = 'query { settings }';

    const { result } = renderHook(() => useGraphqlQuery(mockQueryKey, mockQuery, undefined, { enabled: false }), {
      wrapper
    });
    await new Promise((r) => setTimeout(r, 50));

    expect(mockedGraphqlFetcher).not.toHaveBeenCalled();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isPending).toBe(true);
  });

  it('should fetch data when options.enabled changes from false to true', async () => {
    const testQueryClient = createTestQueryClient();
    const wrapper = createWrapper(testQueryClient);
    const mockResponseData = { settings: { theme: 'dark' } };
    mockedGraphqlFetcher.mockResolvedValue(mockResponseData);
    const { result, rerender } = renderHook(
      ({ enabled }) => useGraphqlQuery(['settings'], 'query { settings }', undefined, { enabled }),
      {
        wrapper,
        initialProps: { enabled: false }
      }
    );

    expect(mockedGraphqlFetcher).not.toHaveBeenCalled();
    rerender({ enabled: true });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedGraphqlFetcher).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockResponseData);
  });
});
