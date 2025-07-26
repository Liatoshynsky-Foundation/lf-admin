import { useMutation, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { ReactQueryProvider } from './reactQueryProvider';
import { AuthError } from '~/back-constants/apolloCustomErrors/authErrors';
import { graphqlFetcher } from '~/hooks/use-graphql-fetcher/useGraphqlFetcher';
import { refreshToken } from '~/utils/refreshToken';

jest.mock('../../../lib/utils/refreshToken');
jest.mock('../../hooks/use-graphql-fetcher/useGraphqlFetcher');

const wrapper = ({ children }: { children: React.ReactNode }) => <ReactQueryProvider>{children}</ReactQueryProvider>;

const mockRefreshToken = refreshToken as jest.Mock;
const mockGraphqlFetcher = graphqlFetcher as jest.Mock;

describe('ReactQueryProvider', () => {
  const originalLocation = window.location;
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '', pathname: '/dashboard' }
    });
  });
  afterAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window.location, 'href', {
      writable: true,
      value: ''
    });
  });

  describe('when using useQuery', () => {
    it('should successfully refresh the token and retry the request on AuthError', async () => {
      mockGraphqlFetcher.mockRejectedValueOnce(new AuthError()).mockResolvedValue({ data: 'some secret data' });
      mockRefreshToken.mockResolvedValue(undefined);

      const { result } = renderHook(() => useQuery({ queryKey: ['test'], queryFn: mockGraphqlFetcher }), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockGraphqlFetcher).toHaveBeenCalledTimes(2);
      expect(result.current.data).toEqual({ data: 'some secret data' });
    });

    it('should cause a redirect to login if token refresh failed', async () => {
      mockGraphqlFetcher.mockRejectedValue(new AuthError());
      mockRefreshToken.mockRejectedValue(new Error('Refresh failed'));

      renderHook(() => useQuery({ queryKey: ['test-fail'], queryFn: mockGraphqlFetcher }), { wrapper });

      await waitFor(() => {
        expect(window.location.href).toBe('/login');
      });
    });

    it('should call refreshToken only once for multiple simultaneous errors', async () => {
      mockGraphqlFetcher.mockRejectedValue(new AuthError());
      mockRefreshToken.mockResolvedValue(undefined);

      renderHook(
        () => {
          useQuery({ queryKey: ['test1'], queryFn: mockGraphqlFetcher });
          useQuery({ queryKey: ['test2'], queryFn: mockGraphqlFetcher });
        },
        { wrapper }
      );

      await waitFor(() => expect(mockRefreshToken).toHaveBeenCalled());

      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
    });
  });

  describe('when using useMutation', () => {
    it('should update the token in the background, but not repeat the mutation automatically', async () => {
      mockGraphqlFetcher.mockRejectedValueOnce(new AuthError());
      mockRefreshToken.mockResolvedValue(undefined);

      const { result } = renderHook(() => useMutation({ mutationFn: mockGraphqlFetcher }), { wrapper });

      result.current.mutate({});

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockGraphqlFetcher).toHaveBeenCalledTimes(1);
    });
  });
});
