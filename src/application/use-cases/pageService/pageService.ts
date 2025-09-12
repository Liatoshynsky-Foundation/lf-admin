import type { BasePage } from '~/domain/entities/Page';
import { PageRepository as PageRepositoryFactory } from '~/infrastructure/repositories/pageRepository/pageRepository';
import { PageStatus } from '~/types/enums/common.enums';
import type { Scalars } from '~/types/graphql/generated/graphql';

export type Patch = {
  $set?: { blocks?: Scalars['JSON']['input'] };
  $unset?: { [key: string]: unknown };
};

export const PageService = ({ pageRepository }: { pageRepository: ReturnType<typeof PageRepositoryFactory> }) => ({
  getPage: async (slug: string): Promise<BasePage | null> => {
    return pageRepository.getPageBySlugAndStatus(slug, PageStatus.Published);
  },

  getPageByStatus: async (slug: string, status: PageStatus): Promise<BasePage | null> => {
    return pageRepository.getPageBySlugAndStatus(slug, status);
  },

  updatePageBlocks: async (input: { slug: string; blocks: Scalars['JSON']['input'] }): Promise<BasePage> => {
    const patch: Patch = { $set: { blocks: input.blocks } };
    return pageRepository.partialUpdateBySlugAndStatus(input.slug, PageStatus.Published, patch);
  },

  upsertDraft: async (input: { slug: string; blocks: Scalars['JSON']['input'] }): Promise<BasePage> => {
    return pageRepository.upsertDraft(input.slug, input.blocks);
  },

  publishPage: async (input: { slug: string; blocks?: Scalars['JSON']['input'] }): Promise<BasePage> => {
    return pageRepository.publishFromBlocks(input.slug, input.blocks);
  }
});
