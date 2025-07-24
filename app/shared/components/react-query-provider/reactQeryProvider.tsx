'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { AuthError } from '~/back-constants/apolloCustomErrors/authErrors';
import { refreshToken } from '~/utils/refreshToken';

let isRefreshing = false;

const handleLogout = (client: QueryClient) => {
  if (window.location.pathname !== '/login') {
    client.clear();
    window.location.href = '/login';
  }
};

export function ReactQueryProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: async (error) => {
            if (error instanceof AuthError) {
              if (!isRefreshing) {
                isRefreshing = true;
                try {
                  await refreshToken();
                  await queryClient.refetchQueries({ predicate: (query) => query.state.status === 'error' });
                } catch {
                  handleLogout(queryClient);
                } finally {
                  isRefreshing = false;
                }
              }
            }
          }
        }),

        mutationCache: new MutationCache({
          onError: async (error) => {
            if (error instanceof AuthError) {
              if (!isRefreshing) {
                isRefreshing = true;
                try {
                  await refreshToken();
                } catch {
                  handleLogout(queryClient);
                } finally {
                  isRefreshing = false;
                }
              }
            }
          }
        }),

        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (error instanceof AuthError) {
                return false;
              }
              return failureCount < 2;
            },
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
