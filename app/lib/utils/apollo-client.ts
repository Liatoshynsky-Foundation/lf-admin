import { ApolloClient, createHttpLink, from, InMemoryCache, Observable } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

import { AuthError } from '~/back-constants/apolloCustomErrors/authErrors';
import { refreshToken } from '~/utils/refreshToken';

const httpLink = createHttpLink({
  uri: '/api/graphql',
  credentials: 'include'
});

export const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        return new Observable((observer) => {
          refreshToken()
            .then(() => {
              forward(operation).subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer)
              });
            })
            .catch((refreshError: AuthError) => {
              window.location.href = '/login';
              observer.error(refreshError);
            });
        });
      }
    }
  }
});

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache()
});
