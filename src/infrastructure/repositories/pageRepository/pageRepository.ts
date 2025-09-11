import mongoose, { Types } from 'mongoose';

import type { Patch } from '~/application/use-cases/pageService/pageService';
import { BasePage } from '~/domain/entities/Page';
import dbConnect from '~/infrastructure/db/connect';
import PageModel from '~/infrastructure/models/page.model';

type DbPage = {
  _id: Types.ObjectId;
  slug: string;
  title: BasePage['title'];
  status: BasePage['status'];
  pageType: string;
  blocks: BasePage['blocks'];
  createdAt: Date | string;
  updatedAt: Date | string;
};

const toIso = (d: Date | string): string => (d instanceof Date ? d.toISOString() : d);

const toEntity = (doc: DbPage): BasePage => ({
  id: doc._id.toString(),
  slug: doc.slug,
  title: doc.title,
  status: doc.status,
  pageType: doc.pageType,
  blocks: doc.blocks,
  createdAt: toIso(doc.createdAt) as unknown as BasePage['createdAt'],
  updatedAt: toIso(doc.updatedAt) as unknown as BasePage['updatedAt']
});

export const PageRepository = () => ({
  getPageBySlugAndStatus: async (slug: string, status: 'draft' | 'published'): Promise<BasePage | null> => {
    await dbConnect();
    const page = await PageModel.findOne({ slug, status }).lean<DbPage>();
    return page ? toEntity(page) : null;
  },

  partialUpdateBySlugAndStatus: async (
    slug: string,
    status: 'draft' | 'published',
    patch: Patch
  ): Promise<BasePage> => {
    await dbConnect();
    const updated = await PageModel.findOneAndUpdate({ slug, status }, patch, {
      new: true,
      strict: false,
      runValidators: true,
      context: 'query'
    }).lean<DbPage>();

    if (!updated) throw new Error(`Page not found by slug="${slug}" & status="${status}"`);
    return toEntity(updated);
  },

  upsertDraft: async (slug: string, blocks: unknown): Promise<BasePage> => {
    await dbConnect();

    if (blocks == null) {
      throw new Error('Draft blocks payload is required');
    }

    const published = await PageModel.findOne({ slug, status: 'published' }).lean<DbPage>();
    if (!published) {
      throw new Error(`Published page not found by slug="${slug}"`);
    }

    const existingDraft = await PageModel.findOne({ slug, status: 'draft' });
    if (existingDraft) {
      existingDraft.set({ blocks });
      const saved = await existingDraft.save();
      return toEntity(saved.toObject() as unknown as DbPage);
    }

    const pageType = published.pageType;

    const discriminators = (
      PageModel as mongoose.Model<any> & {
        discriminators?: Record<string, mongoose.Model<any>>;
      }
    ).discriminators;

    const DiscriminatorModel = discriminators?.[pageType] ?? PageModel;

    const created = await new DiscriminatorModel({
      slug,
      status: 'draft' as const,
      title: published.title,
      pageType,
      blocks
    }).save();

    return toEntity(created.toObject() as unknown as DbPage);
  },

  publishFromBlocks: async (slug: string, blocks?: unknown): Promise<BasePage> => {
    await dbConnect();

    let finalBlocks = blocks;
    if (finalBlocks === undefined) {
      const draft = await PageModel.findOne({ slug, status: 'draft' }).lean<DbPage>();
      if (!draft) throw new Error(`Draft page not found by slug="${slug}"`);
      finalBlocks = draft.blocks;
    }

    const source =
      (await PageModel.findOne({ slug, status: 'draft' }).lean<DbPage>()) ??
      (await PageModel.findOne({ slug, status: 'published' }).lean<DbPage>());

    if (!source) throw new Error(`No source page found by slug="${slug}"`);

    const updated = await PageModel.findOneAndUpdate(
      { slug, status: 'published' },
      {
        $set: {
          blocks: finalBlocks,
          title: source.title,
          pageType: source.pageType
        },
        $setOnInsert: { slug, status: 'published' as const }
      },
      { new: true, upsert: true, runValidators: true, context: 'query', strict: false }
    ).lean<DbPage>();

    await PageModel.deleteOne({ slug, status: 'draft' });

    return toEntity(updated);
  }
});
