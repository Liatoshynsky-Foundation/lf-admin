import type { BasePage } from '~/domain/entities/Page';
import { PageRepository as PageRepositoryFactory } from '~/infrastructure/repositories/pageRepository/pageRepository';
import { PageStatus } from '~/types/enums/common.enums';
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

  updatePageBlocks: async (input: { slug: string; blocks: Scalars['JSON']['input'] }): Promise<BasePage> => {
    return pageRepository.upsertDraftBySlug(input.slug, input.blocks);
  },

  upsertDraft: async (input: { slug: string; blocks: Scalars['JSON']['input'] }): Promise<BasePage> => {
    return pageRepository.upsertDraftBySlug(input.slug, input.blocks);
  },

  publishPage: async (input: { slug: string; blocks?: Scalars['JSON']['input'] }): Promise<BasePage> => {
    return pageRepository.publishBySlug(input.slug, input.blocks);
  }
});
