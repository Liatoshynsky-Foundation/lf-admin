import { BasePage } from '../entities/Page';
import { PageRepository as PageRepositoryType } from '~/infrastructure/repositories/pageRepository/pageRepository';

export const PageService = (repo: ReturnType<typeof PageRepositoryType>) => ({
  getPage: async (slug: string): Promise<BasePage | null> => {
    const page = await repo.getPageBySlug(slug);
    if (!page) return null;

    return page;
  }
});
