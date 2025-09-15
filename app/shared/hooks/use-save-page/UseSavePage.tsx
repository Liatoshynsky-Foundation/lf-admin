'use client';
import { ApolloError } from '@apollo/client';
import isEqual from 'fast-deep-equal';

import { useStore } from '~/store';
import {
  type PublishPageMutationVariables,
  type UpsertPageDraftMutationVariables,
  usePublishPageMutation,
  useUpsertPageDraftMutation
} from '~/types/graphql/generated/graphql';

const hasChanged = (current: unknown, baseline: unknown): boolean =>
  baseline === undefined || (current !== baseline && !isEqual(current, baseline));

const apolloMessage = (e: ApolloError, networkMsg: string): string =>
  e.graphQLErrors[0]?.message ?? (e.networkError ? networkMsg : e.message);

const safeMutate = <V, R>(
  mutate: (options: { variables: V }) => Promise<R>,
  variables: V,
  networkMsg: string,
  fallbackMsg: string
): Promise<R> => {
  return mutate({ variables }).catch((e: unknown) => {
    if (e instanceof ApolloError) throw new Error(apolloMessage(e, networkMsg));
    throw new Error(fallbackMsg);
  });
};

type PublishResponse = { data?: { publishPage?: unknown } };

const getPublishedOrThrow = (res: PublishResponse) => {
  const page = res?.data?.publishPage;
  if (!page) throw new Error('Server did not return published page');
  return page;
};

export const useSavePageBlocks = (pageSlug: string) => {
  const markSaved = useStore((s) => s.saveAsDraft);

  const [upsertDraft, upsertState] = useUpsertPageDraftMutation();
  const [publishMutate, publishState] = usePublishPageMutation();

  const save = async () => {
    const state = useStore.getState();
    const current = state.blocks[pageSlug];
    const baseline = state.originalBlocks?.[pageSlug];

    if (current == null) throw new Error('No page blocks found');
    if (!hasChanged(current, baseline)) throw new Error('Nothing to save');

    const draftVars: UpsertPageDraftMutationVariables = { input: { slug: pageSlug, blocks: current } };
    await safeMutate(upsertDraft, draftVars, 'Network error while saving draft', 'Failed to save draft');

    const publishVars: PublishPageMutationVariables = { input: { slug: pageSlug, blocks: current } };
    const res = await safeMutate<PublishPageMutationVariables, PublishResponse>(
      publishMutate as unknown as (o: { variables: PublishPageMutationVariables }) => Promise<PublishResponse>,
      publishVars,
      'Network error while publishing',
      'Failed to publish page'
    );

    const published = getPublishedOrThrow(res);
    markSaved(pageSlug);
    return published;
  };

  return {
    save,
    loading: upsertState.loading || publishState.loading,
    error: upsertState.error ?? publishState.error,
    data: publishState.data
  };
};
