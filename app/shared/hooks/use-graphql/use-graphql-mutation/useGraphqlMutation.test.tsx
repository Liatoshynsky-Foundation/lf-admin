import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { useGraphqlMutation } from './useGraphqlMutation';
import { graphqlFetcher } from '~/hooks/use-graphql-fetcher/useGraphqlFetcher';

jest.mock('../../use-graphql-fetcher/useGraphqlFetcher', () => ({
  graphqlFetcher: jest.fn()
}));

const mockedGraphqlFetcher = graphqlFetcher as jest.Mock;

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

const createWrapper = (client: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('useGraphqlMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful mutation', async () => {
    const testQueryClient = createTestQueryClient();
    const wrapper = createWrapper(testQueryClient);
    const mockQuery = 'mutation { doSomething }';
    const mockVariables = { id: 'abc' };
    const mockResponse = { data: { success: true } };

    mockedGraphqlFetcher.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGraphqlMutation(mockQuery), { wrapper });

    result.current.mutate(mockVariables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResponse);
    expect(mockedGraphqlFetcher).toHaveBeenCalledWith({ query: mockQuery, variables: mockVariables });
  });

  it('should handle mutation error', async () => {
    const testQueryClient = createTestQueryClient();
    const wrapper = createWrapper(testQueryClient);
    const mockError = new Error('Something went wrong');
    const onErrorCallback = jest.fn();

    mockedGraphqlFetcher.mockRejectedValue(mockError);

    const { result } = renderHook(() => useGraphqlMutation('mutation { fail }', { onError: onErrorCallback }), {
      wrapper
    });

    result.current.mutate({});

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
    expect(onErrorCallback).toHaveBeenCalledWith(mockError, {}, undefined);
  });
});
