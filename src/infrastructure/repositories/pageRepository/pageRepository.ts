import mongoose, { Types } from 'mongoose';

import type { Patch } from '~/application/use-cases/pageService/pageService';
import { BasePage } from '~/domain/entities/Page';
import dbConnect from '~/infrastructure/db/connect';
import PageModel from '~/infrastructure/models/page.model';
import { PageStatus } from '~/types/enums/common.enums';

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
  getPageBySlugAndStatus: async (slug: string, status: PageStatus): Promise<BasePage | null> => {
    await dbConnect();
    const page = await PageModel.findOne({ slug, status }).lean<DbPage>();
    return page ? toEntity(page) : null;
  },

  partialUpdateBySlugAndStatus: async (slug: string, status: PageStatus, patch: Patch): Promise<BasePage> => {
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

    const published = await PageModel.findOne({ slug, status: PageStatus.Published }).lean<DbPage>();
    if (!published) {
      throw new Error(`Published page not found by slug="${slug}"`);
    }

    const existingDraft = await PageModel.findOne({ slug, status: PageStatus.Draft });
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
      status: PageStatus.Draft,
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
      const draft = await PageModel.findOne({ slug, status: PageStatus.Draft }).lean<DbPage>();
      if (!draft) throw new Error(`Draft page not found by slug="${slug}"`);
      finalBlocks = draft.blocks;
    }

    const source =
      (await PageModel.findOne({ slug, status: PageStatus.Draft }).lean<DbPage>()) ??
      (await PageModel.findOne({ slug, status: PageStatus.Published }).lean<DbPage>());

    if (!source) throw new Error(`No source page found by slug="${slug}"`);

    const updated = await PageModel.findOneAndUpdate(
      { slug, status: PageStatus.Published },
      {
        $set: {
          blocks: finalBlocks,
          title: source.title,
          pageType: source.pageType
        },
        $setOnInsert: { slug, status: PageStatus.Published }
      },
      { new: true, upsert: true, runValidators: true, context: 'query', strict: false }
    ).lean<DbPage>();

    await PageModel.deleteOne({ slug, status: PageStatus.Draft });

    return toEntity(updated);
  }
});
