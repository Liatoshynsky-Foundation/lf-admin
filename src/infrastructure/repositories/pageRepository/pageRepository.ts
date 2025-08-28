import { BasePage } from '~/domain/entities/Page';
import dbConnect from '~/infrastructure/db/connect';
import PageModel from '~/infrastructure/models/page.model';

export const PageRepository = () => ({
  getPageBySlug: async (slug: string): Promise<BasePage | null> => {
    await dbConnect();

    const page = await PageModel.findOne({ slug });

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
  }
});
