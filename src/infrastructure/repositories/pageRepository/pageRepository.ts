import mongoose from 'mongoose';

import { BasePage } from '~/domain/entities/Page';
import dbConnect from '~/infrastructure/db/connect';

export const PageRepository = () => ({
  getPageBySlug: async (slug: string): Promise<BasePage | null> => {
    await dbConnect();
    const pageCollection = mongoose.connection.collection('pages');
    const page = await pageCollection.findOne({ slug });

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
