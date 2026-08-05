import { GraphQLError } from 'graphql';

import { syncImagesCrops } from '../helpers';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { createDotNotationPatch } from '~/src/application/use-cases/dotNotationPatch/dotNotationPatch';
import { removeTmpFlagsRecursively } from '~/src/application/use-cases/removeTmpFlags/removeTmpFlags';
import { JsonObject } from '~/src/shared/types/pages/types';
import type { Page, Scalars, UpdatePageSeoInput } from '~/types/graphql/generated/graphql';

type UpsertPageDraftArgs = { input: { slug: string; blocks: Scalars['JSON']['input']; blocksOrder: string[] } };
type PublishPageArgs = { input: { slug: string; blocks?: Scalars['JSON']['input']; blocksOrder: string[] } };
type UpdatePageSeoArgs = { input: UpdatePageSeoInput };

export const PageMutation = {
  async upsertPageDraft(
    _: unknown,
    { input }: UpsertPageDraftArgs,
    { requestContainer, admin }: GraphQLContext
  ): Promise<Page> {
    if (!admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }
    if (input.blocks == null) {
      throw new GraphQLError(graphqlErrors.DRAFT_BLOCKS_REQUIRED.message, {
        extensions: { code: graphqlErrors.DRAFT_BLOCKS_REQUIRED.code }
      });
    }

    const repo = requestContainer.cradle.pageRepository;

    const { slug, blocks, blocksOrder } = input;

    const cleanedBlocks = removeTmpFlagsRecursively(blocks);

    const existingDraft = await repo.getDraftBySlug(slug);

    let resultPage: Page;
    if (!existingDraft) {
      const published = await repo.getPublishedBySlug(slug);
      if (!published) {
        throw new Error(`Cannot upsert draft: no source (draft or published) for slug="${slug}"`);
      }
      resultPage = await repo.createDraft(slug, cleanedBlocks, blocksOrder, published);
    } else {
      const changes = createDotNotationPatch(
        (existingDraft.blocks as unknown as JsonObject) || {}, // NOSONAR
        (cleanedBlocks as JsonObject) || {} // NOSONAR
      );
      const hasOrderChanged = JSON.stringify(existingDraft.blocksOrder) !== JSON.stringify(blocksOrder);

      if (!Object.keys(changes.$set ?? {}).length && !Object.keys(changes.$unset ?? {}).length && !hasOrderChanged) {
        resultPage = existingDraft;
      } else {
        resultPage = await repo.applyPatchToDraft(slug, blocksOrder, changes);
      }
    }

    await syncImagesCrops(resultPage.id, blocks);

    return resultPage;
  },

  async publishPage(
    _: unknown,
    { input }: PublishPageArgs,
    { requestContainer, admin }: GraphQLContext
  ): Promise<Page> {
    if (!admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const repo = requestContainer.cradle.pageRepository;

    const { slug, blocks, blocksOrder } = input;

    let blocksToPublish = blocks;

    if (blocksToPublish === undefined) {
      const draft = await repo.getDraftBySlug(slug);
      if (!draft) {
        throw new Error(`Cannot publish: Draft not found by slug="${slug}" and no blocks provided.`);
      }
      blocksToPublish = draft.blocks;
    }

    const cleanedBlocks = removeTmpFlagsRecursively(blocksToPublish);

    const [publishedPage, draftPage] = await Promise.all([repo.getPublishedBySlug(slug), repo.getDraftBySlug(slug)]);

    const title = draftPage?.title ?? publishedPage?.title;
    const pageType = draftPage?.pageType ?? publishedPage?.pageType;

    if (!title || !pageType) {
      throw new Error(`Cannot upsert draft: no source (draft or published) for slug="${slug}"`);
    }

    const changes = createDotNotationPatch(
      (publishedPage?.blocks as unknown as JsonObject) || {}, // NOSONAR
      (cleanedBlocks as JsonObject) || {} // NOSONAR
    );

    const resultPage = (await repo.applyPatchToPublished(slug, changes, blocksOrder, title, pageType)) as Page;

    await syncImagesCrops(resultPage.id, blocksToPublish);

    return resultPage;
  },

  async updatePageSeo(
    _: unknown,
    { input }: UpdatePageSeoArgs,
    { requestContainer, admin }: GraphQLContext
  ): Promise<Page> {
    if (!admin) {
      throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
      });
    }

    const repo = requestContainer.cradle.pageRepository;
    const resultPage = await repo.updatePageSeo(input.slug, input);

    return resultPage as Page;
  }
};
