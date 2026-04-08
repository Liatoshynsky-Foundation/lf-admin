import { GraphQLError } from 'graphql';
import { Types } from 'mongoose';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { ImageCropModel } from '~/infrastructure/models/imageCrop.model';
import { createDotNotationPatch } from '~/src/application/use-cases/dotNotationPatch/dotNotationPatch';
import { extractImageSrcs,extractImagesWithMetadata } from '~/src/application/use-cases/extractImageSrc/extractImageSrc';
import { removeTmpFlagsRecursively } from '~/src/application/use-cases/removeTmpFlags/removeTmpFlags';
import { blobStorageService } from '~/src/application/use-cases/uploadService/upload';
import { JsonObject } from '~/src/shared/types/pages/types';
import type { Page, Scalars } from '~/types/graphql/generated/graphql';

type UpsertPageDraftArgs = { input: { slug: string; blocks: Scalars['JSON']['input'] } };
type PublishPageArgs = { input: { slug: string; blocks?: Scalars['JSON']['input'] } };

async function syncImageCrops(blocks: Scalars['JSON']['input'], pageId: string) {
  const imagesWithMetadata = extractImagesWithMetadata(blocks);

  for (const item of imagesWithMetadata) {
    if (item.crop) {
      await ImageCropModel.findOneAndUpdate(
        {
          cropId: item.src,
          pageId: pageId
        },
        {
          crop: item.crop,
          imageAssetId: new Types.ObjectId(),
          locale: 'uk',
        },
        { upsert: true, new: true }
      );
    }
  }
}

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

    const { slug, blocks } = input;

    const imageSrcs = extractImageSrcs(blocks);
    if (imageSrcs.length) {
      await blobStorageService().copyBlobsToNewFolder('tmp', 'photos', imageSrcs);
    }

    const cleanedBlocks = removeTmpFlagsRecursively(blocks);

    const existingDraft = await repo.getDraftBySlug(slug);

    let resultPage: Page;
    if (!existingDraft) {
      const published = await repo.getPublishedBySlug(slug);
      if (!published) {
        throw new Error(`Cannot upsert draft: no source (draft or published) for slug="${slug}"`);
      }
      resultPage = await repo.createDraft(slug, cleanedBlocks, published) as Page;
    } else {
      const changes = createDotNotationPatch(
        (existingDraft.blocks as JsonObject) || {},
        (cleanedBlocks as JsonObject) || {}
      );

      if (!Object.keys(changes.$set ?? {}).length && !Object.keys(changes.$unset ?? {}).length) {
        resultPage = existingDraft as Page;
      } else {
        resultPage = await repo.applyPatchToDraft(slug, changes) as Page;
      }
    }

    await syncImageCrops(blocks, resultPage.id);

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

    const { slug, blocks } = input;

    let blocksToPublish = blocks;

    if (blocksToPublish === undefined) {
      const draft = await repo.getDraftBySlug(slug);
      if (!draft) {
        throw new Error(`Cannot publish: Draft not found by slug="${slug}" and no blocks provided.`);
      }
      blocksToPublish = draft.blocks;
    }

    const imageSrcs = extractImageSrcs(blocksToPublish);
    if (imageSrcs.length) {
      await blobStorageService().copyBlobsToNewFolder('tmp', 'photos', imageSrcs);
    }

    const cleanedBlocks = removeTmpFlagsRecursively(blocksToPublish);

    const [publishedPage, draftPage] = await Promise.all([repo.getPublishedBySlug(slug), repo.getDraftBySlug(slug)]);

    const title = draftPage?.title ?? publishedPage?.title;
    const pageType = draftPage?.pageType ?? publishedPage?.pageType;

    if (!title || !pageType) {
      throw new Error(`Cannot upsert draft: no source (draft or published) for slug="${slug}"`);
    }

    const changes = createDotNotationPatch(
      (publishedPage?.blocks as JsonObject) || {},
      (cleanedBlocks as JsonObject) || {}
    );

    const resultPage = await repo.applyPatchToPublished(slug, changes, title, pageType) as Page;

    await syncImageCrops(blocksToPublish, resultPage.id);

    return resultPage;
  }
};
