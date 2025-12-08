import { createDotNotationPatch } from '~/application/use-cases/dotNotationPatch/dotNotationPatch';
import { extractImageSrcs } from '~/application/use-cases/extractImageSrc/extractImageSrc';
import { removeTmpFlagsRecursively } from '~/application/use-cases/removeTmpFlags/removeTmpFlags';
import { blobStorageService } from '~/application/use-cases/uploadService/upload';
import { PageStatus } from '~/back-shared/types/enums/common.enums';
import { JsonObject } from '~/back-shared/types/pages/types';
import type { BasePage } from '~/domain/entities/Page';
import { PageRepository as PageRepositoryFactory } from '~/infrastructure/repositories/pageRepository/pageRepository';
import type { Scalars } from '~/types/graphql/generated/graphql';

type Repo = ReturnType<typeof PageRepositoryFactory>;

export const PageService = ({ pageRepository }: { pageRepository: Repo }) => ({
  getPage: async (slug: string): Promise<BasePage | null> => {
    return pageRepository.getPublishedBySlug(slug);
  },

  getPageByStatus: async (slug: string, status: PageStatus): Promise<BasePage | null> => {
    if (status === PageStatus.Published) return pageRepository.getPublishedBySlug(slug);
    if (status === PageStatus.Draft) return pageRepository.getDraftBySlug(slug);
    return null;
  },

  upsertDraft: async (input: { slug: string; blocks: Scalars['JSON']['input'] }): Promise<BasePage> => {
    const { slug, blocks } = input;

    const imageSrcs = extractImageSrcs(blocks);
    if (imageSrcs.length) {
      await blobStorageService().copyBlobsToNewFolder('tmp', 'photos', imageSrcs);
    }

    const cleanedBlocks = removeTmpFlagsRecursively(blocks);
    const existingDraft = await pageRepository.getDraftBySlug(slug);

    if (!existingDraft) {
      const published = await pageRepository.getPublishedBySlug(slug);
      if (!published) {
        throw new Error(`Cannot upsert draft: no source (draft or published) for slug="${slug}"`);
      }
      return pageRepository.createDraft(slug, cleanedBlocks, published);
    }

    const changes = createDotNotationPatch(
      (existingDraft.blocks as JsonObject) || {},
      (cleanedBlocks as JsonObject) || {}
    );
    if (!Object.keys(changes.$set ?? {}).length && !Object.keys(changes.$unset ?? {}).length) {
      return existingDraft;
    }

    return pageRepository.applyPatchToDraft(slug, changes);
  },

  publishPage: async (input: { slug: string; blocks?: Scalars['JSON']['input'] }): Promise<BasePage> => {
    const { slug, blocks } = input;
    let blocksToPublish = blocks;

    if (blocksToPublish === undefined) {
      const draft = await pageRepository.getDraftBySlug(slug);
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

    const [publishedPage, draftPage] = await Promise.all([
      pageRepository.getPublishedBySlug(slug),
      pageRepository.getDraftBySlug(slug)
    ]);

    const title = draftPage?.title ?? publishedPage?.title;
    const pageType = draftPage?.pageType ?? publishedPage?.pageType;

    if (!title || !pageType) {
      throw new Error(`Cannot upsert draft: no source (draft or published) for slug="${slug}"`);
    }

    const changes = createDotNotationPatch(
      (publishedPage?.blocks as JsonObject) || {},
      (cleanedBlocks as JsonObject) || {}
    );

    return await pageRepository.applyPatchToPublished(slug, changes, title, pageType);
  }
});
