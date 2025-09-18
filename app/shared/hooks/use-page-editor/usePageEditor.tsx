'use client';
import isEqual from 'fast-deep-equal';

import { fetchPreview } from '~/lib/utils/fetchPreview';
import { safeMutate } from '~/lib/utils/safeMutate';
import { useStore } from '~/store';
import {
  type PublishPageMutation,
  type PublishPageMutationVariables,
  type UpsertPageDraftMutation,
  type UpsertPageDraftMutationVariables,
  usePublishPageMutation,
  useUpsertPageDraftMutation
} from '~/types/graphql/generated/graphql';

const changedNow = (current: unknown, baseline: unknown, flag: boolean): boolean =>
  flag || baseline === undefined || (current !== baseline && !isEqual(current, baseline));

export const usePageEditor = (slug: string) => {
  const locale = useStore((s) => s.locale);
  const isChanged = useStore((s) => s.isChanged);
  const markSaved = useStore((s) => s.saveAsDraft);

  const [upsertDraft, { loading: creatingDraft }] = useUpsertPageDraftMutation();
  const [publishMutate, { loading: publishing, error, data }] = usePublishPageMutation();

  const preview = async () => {
    const blocks = useStore.getState().blocks[slug];
    if (!blocks) throw new Error('No page blocks found');

    const response = await safeMutate<UpsertPageDraftMutation, UpsertPageDraftMutationVariables>(
      upsertDraft,
      { input: { slug, blocks } },
      'Network error while creating draft',
      'Failed to create draft'
    );

    const draftId = response.data?.upsertPageDraft?.id;
    if (!draftId) throw new Error('Draft ID is missing');

    await fetchPreview({ slug, lang: locale, draftId });
  };

  const publish = async () => {
    const state = useStore.getState();
    const current = state.blocks[slug];
    const baseline = state.originalBlocks?.[slug];

    if (!current) throw new Error('No page blocks found');
    if (!changedNow(current, baseline, state.isChanged)) throw new Error('Nothing to publish');

    const response = await safeMutate<PublishPageMutation, PublishPageMutationVariables>(
      publishMutate,
      { input: { slug, blocks: current } },
      'Network error while publishing',
      'Failed to publish page'
    );

    const published = response.data?.publishPage;
    if (!published) throw new Error('Server did not return published page');

    markSaved(slug);
    return published;
  };

  return {
    locale,
    isChanged,
    preview,
    publish,
    loading: creatingDraft || publishing,
    error,
    data
  };
};
