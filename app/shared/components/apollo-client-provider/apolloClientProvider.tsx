'use client';

import { ApolloProvider } from '@apollo/client';

import { client } from '~/lib/utils/apollo-client';

export function ApolloClientProvider({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
