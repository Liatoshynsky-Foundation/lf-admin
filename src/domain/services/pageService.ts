import { BasePage } from '../entities/Page';
import { PageRepository as PageRepositoryType } from '~/infrastructure/repositories/pageRepository/pageRepository';
import type { Scalars } from '~/types/graphql/generated/graphql';

export type Patch = {
  $set?: { blocks?: Scalars['JSON']['input'] };
  $unset?: { [key: string]: unknown };
};

export const PageService = (repo: ReturnType<typeof PageRepositoryType>) => ({
  getPage: async (slug: string): Promise<BasePage | null> => {
    const page = await repo.getPageBySlug(slug);
    if (!page) return null;

    return page;
  },

  updatePageBlocks: async (input: { slug: string; blocks: Scalars['JSON']['input'] }): Promise<BasePage> => {
    const patch: Patch = {
      $set: { blocks: input.blocks }
    };

    const updated = await repo.partialUpdateBySlug(input.slug, patch);
    return updated;
  }
});
