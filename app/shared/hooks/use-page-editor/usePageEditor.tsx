'use client';
import { ApolloError } from '@apollo/client';

import { fetchPreview } from '~/lib/utils/fetchPreview';
import { useStore } from '~/store';
import {
  type PublishPageMutationVariables,
  type UpsertPageDraftMutationVariables,
  usePublishPageMutation,
  useUpsertPageDraftMutation
} from '~/types/graphql/generated/graphql';

export const usePageEditor = (slug: string) => {
  const locale = useStore((s) => s.locale);
  const isChanged = useStore((s) => s.isChanged);
  const markSaved = useStore((s) => s.saveAsDraft);

  const [upsertDraft, { loading: creatingDraft }] = useUpsertPageDraftMutation();
  const [publishMutate, { loading: publishing, error, data }] = usePublishPageMutation();

  const preview = async () => {
    const blocks = useStore.getState().blocks[slug];
    if (!blocks) throw new Error('No page blocks found');

    try {
      const variables: UpsertPageDraftMutationVariables = { input: { slug, blocks } };
      const { data } = await upsertDraft({ variables });
      const draftId = data?.upsertPageDraft?.id;
      if (!draftId) throw new Error('Draft ID is missing');
      await fetchPreview({ slug, lang: locale, draftId });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to create draft';
      throw new Error(msg);
    }
  };

  const publish = async () => {
    const state = useStore.getState();
    const current = state.blocks[slug];
    const baseline = state.originalBlocks?.[slug] ?? {};
    const changedNow = state.isChanged || JSON.stringify(current ?? {}) !== JSON.stringify(baseline ?? {});

    if (!current) throw new Error('No page blocks found');
    if (!changedNow) throw new Error('Nothing to publish');

    const variables: PublishPageMutationVariables = { input: { slug, blocks: current } };

    const res = await publishMutate({ variables }).catch((e: unknown) => {
      if (e instanceof ApolloError) {
        const msg = e.graphQLErrors[0]?.message ?? (e.networkError ? 'Network error while publishing' : e.message);
        throw new Error(msg);
      }
      throw new Error('Failed to publish page');
    });

    if (!res?.data?.publishPage) throw new Error('Server did not return published page');

    markSaved(slug);
    return res.data.publishPage;
  };

  return { locale, isChanged, preview, publish, loading: creatingDraft || publishing, error, data };
};
