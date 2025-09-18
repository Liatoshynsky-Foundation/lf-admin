import { Model, Types } from 'mongoose';

import { BasePage } from '~/domain/entities/Page';
import dbConnect from '~/infrastructure/db/connect';
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

type PageRepoDeps = Readonly<{
  PageModel: Model<BasePage>;
  DraftPageModel: Model<BasePage>;
}>;

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

const getBySlug = async (model: Model<BasePage>, slug: string): Promise<BasePage | null> => {
  await dbConnect();
  const doc = await model.findOne({ slug }).lean<DbPage>();
  return doc ? toEntity(doc) : null;
};

export const PageRepository = ({ PageModel, DraftPageModel }: PageRepoDeps) => {
  return {
    getPublishedBySlug: (slug: string) => getBySlug(PageModel, slug),
    getDraftBySlug: (slug: string) => getBySlug(DraftPageModel, slug),

    upsertDraftBySlug: async (slug: string, blocks: unknown): Promise<BasePage> => {
      await dbConnect();
      if (blocks == null) throw new Error('Draft blocks payload is required');

      const [draft, published] = await Promise.all([
        DraftPageModel.findOne({ slug }).lean<DbPage>(),
        PageModel.findOne({ slug }).lean<DbPage>()
      ]);

      const title = draft?.title ?? published?.title;
      const pageType = draft?.pageType ?? published?.pageType;

      if (!title || !pageType) {
        throw new Error(`Cannot upsert draft: no source (draft or published) for slug="${slug}"`);
      }

      const updated = await DraftPageModel.findOneAndUpdate(
        { slug },
        {
          $set: {
            slug,
            status: PageStatus.Draft,
            title,
            pageType,
            blocks
          }
        },
        { new: true, upsert: true, runValidators: true, context: 'query' }
      ).lean<DbPage>();

      return toEntity(updated as DbPage);
    },

    publishBySlug: async (slug: string, blocksOverride?: unknown): Promise<BasePage> => {
      await dbConnect();
      const draft = await DraftPageModel.findOne({ slug }).lean<DbPage>();
      if (!draft && blocksOverride === undefined) {
        throw new Error(`Draft not found by slug="${slug}"`);
      }

      const finalBlocks = blocksOverride ?? draft!.blocks;
      const published = draft ? null : await PageModel.findOne({ slug }).lean<DbPage>();
      const title = draft?.title ?? published?.title;
      const pageType = draft?.pageType ?? published?.pageType;

      if (!title || !pageType) {
        throw new Error(`Cannot publish: missing title/pageType for slug="${slug}"`);
      }

      const updated = await PageModel.findOneAndUpdate(
        { slug },
        {
          $set: {
            status: PageStatus.Published,
            title,
            pageType,
            blocks: finalBlocks
          }
        },
        { new: true, upsert: true, runValidators: true, context: 'query', strict: false }
      ).lean<DbPage>();

      return toEntity(updated as DbPage);
    }
  };
};
