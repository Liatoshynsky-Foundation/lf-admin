import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import type { Decorator } from '@storybook/react';
import React, { useMemo, useState } from 'react';

import { AppProviders } from '../app/shared/providers/AppProviders';

interface ProviderProps {
  children: React.ReactNode;
}

function StorybookEmotionProvider({ children }: Readonly<ProviderProps>) {
  const [cache] = useState(() => {
    const emotionCache = createCache({ key: 'sb-css', prepend: true });
    emotionCache.compat = true;
    return emotionCache;
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

function StorybookApolloProvider({ children }: Readonly<ProviderProps>) {
  const client = useMemo(
    () =>
      new ApolloClient({
        cache: new InMemoryCache(),
        link: new HttpLink({
          uri: '/api/graphql',
          credentials: 'include',
        }),
      }),
    []
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export const withStorybookProviders: Decorator = (Story) => {
  const ApolloProviderComponent = ({ children }: ProviderProps) => (
    <StorybookApolloProvider>{children}</StorybookApolloProvider>
  );

  return (
    <AppProviders
      ApolloProviderComponent={ApolloProviderComponent}
      EmotionProviderComponent={StorybookEmotionProvider}
    >
      <Story />
    </AppProviders>
  );
};