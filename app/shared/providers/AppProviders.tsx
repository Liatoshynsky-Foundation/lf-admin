'use client';

import React, { type ComponentType } from 'react';

import { ThemeProvider } from '../../providers/ThemeProvider';
import { ApolloClientProvider } from './apollo-client-provider/apolloClientProvider';
import EmotionProvider from './EmotionProvider';

interface ProviderProps {
  children: React.ReactNode;
}

type ProviderComponent = ComponentType<ProviderProps>;

interface AppProvidersProps extends ProviderProps {
  ApolloProviderComponent?: ProviderComponent;
  EmotionProviderComponent?: ProviderComponent;
}

export function AppProviders({
  children,
  ApolloProviderComponent = ApolloClientProvider,
  EmotionProviderComponent = EmotionProvider,
}: Readonly<AppProvidersProps>) {
  return (
    <EmotionProviderComponent>
      <ThemeProvider>
        <ApolloProviderComponent>{children}</ApolloProviderComponent>
      </ThemeProvider>
    </EmotionProviderComponent>
  );
}