import { BasePage } from '~/domain/entities/Page';
import type { Patch } from '~/domain/services/pageService';
import dbConnect from '~/infrastructure/db/connect';
import PageModel from '~/infrastructure/models/page.model';

export const PageRepository = () => ({
  getPageBySlug: async (slug: string): Promise<BasePage | null> => {
    await dbConnect();
    const page = await PageModel.findOne({ slug }).lean();
    if (!page) return null;

    return {
      id: page._id.toString(),
      slug: page.slug,
      title: page.title,
      status: page.status,
      pageType: page.pageType,
      blocks: page.blocks,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt
    };
  },

  partialUpdateBySlug: async (slug: string, patch: Patch): Promise<BasePage> => {
    await dbConnect();
    const updated = await PageModel.findOneAndUpdate({ slug }, patch, { new: true, strict: false }).lean();

    if (!updated) throw new Error(`Page not found by slug="${slug}"`);

    return {
      id: updated._id.toString(),
      slug: updated.slug,
      title: updated.title,
      status: updated.status,
      pageType: updated.pageType,
      blocks: updated.blocks,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };
  }
});
