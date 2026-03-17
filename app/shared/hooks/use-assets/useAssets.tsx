'use client';

import { AssetsFiltersInput, useAllAssetsQuery } from '~/types/graphql/generated/graphql';

export const useAllAssets = (filters?: AssetsFiltersInput) =>
  useAllAssetsQuery({ variables: { filters }, fetchPolicy: 'network-only' });
