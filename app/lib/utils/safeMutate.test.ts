import { ApolloError } from '@apollo/client';

import {safeMutate } from './safeMutate';

describe('safeMutate and apolloMessage', () => {
  const mockMutate = jest.fn();
  const networkMsg = 'Network issues';
  const fallbackMsg = 'Something went wrong';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return data on successful mutation', async () => {
    const mockResult = { data: { success: true } };
    mockMutate.mockResolvedValueOnce(mockResult);

    const result = await safeMutate(mockMutate, { id: 1 }, networkMsg, fallbackMsg);

    expect(result).toEqual(mockResult);
    expect(mockMutate).toHaveBeenCalledWith({ variables: { id: 1 } });
  });

  it('should pass optional mutation options to mutate', async () => {
    const mockResult = { data: { success: true } };
    mockMutate.mockResolvedValueOnce(mockResult);
    const refetchQueries = [{ kind: 'Document' }];

    await safeMutate(mockMutate, { id: 1 }, networkMsg, fallbackMsg, {
      refetchQueries,
      awaitRefetchQueries: true
    });

    expect(mockMutate).toHaveBeenCalledWith({
      variables: { id: 1 },
      refetchQueries,
      awaitRefetchQueries: true
    });
  });

  it('should throw GraphQL error message if graphQLErrors are present', async () => {
    const graphQLError = new ApolloError({
      graphQLErrors: [{ message: 'GraphQL specific error' }]
    });
    mockMutate.mockRejectedValueOnce(graphQLError);

    await expect(safeMutate(mockMutate, {}, networkMsg, fallbackMsg)).rejects.toThrow('GraphQL specific error');
  });

  it('should throw network message if networkError is present and graphQLErrors is empty', async () => {
    const networkError = new ApolloError({
      graphQLErrors: [],
      networkError: new Error('Failed to fetch')
    });
    mockMutate.mockRejectedValueOnce(networkError);

    await expect(safeMutate(mockMutate, {}, networkMsg, fallbackMsg)).rejects.toThrow(networkMsg);
  });

  it('should throw base Apollo error message if both graphQLErrors and networkError are missing', async () => {
    const genericApolloError = new ApolloError({
      graphQLErrors: [],
      errorMessage: 'Generic Apollo implementation failure'
    });
    mockMutate.mockRejectedValueOnce(genericApolloError);

    await expect(safeMutate(mockMutate, {}, networkMsg, fallbackMsg)).rejects.toThrow(
      'Generic Apollo implementation failure'
    );
  });

  it('should throw fallback message if the error is not an instance of ApolloError', async () => {
    const regularError = new Error('Regular runtime error');
    mockMutate.mockRejectedValueOnce(regularError);

    await expect(safeMutate(mockMutate, {}, networkMsg, fallbackMsg)).rejects.toThrow(fallbackMsg);
  });
});
