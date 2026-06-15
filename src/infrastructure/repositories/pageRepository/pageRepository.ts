import { FilterQuery, Model, Types } from 'mongoose';

import { JsonObject, Patch } from '~/back-shared/types/pages/types';
import { BasePage, LocalizedTitle } from '~/domain/entities/Page';
import dbConnect from '~/infrastructure/db/connect';
import { PageRepository as PageRepositoryType } from '~/src/domain/repositories/pageRepository';
import { PageCategory, PageStatus } from '~/types/enums/common.enums';

type DbPage = {
  _id: Types.ObjectId;
  slug: string;
  title: BasePage['title'];
  status: BasePage['status'];
  pageType: string;
  category: BasePage['category'];
  coverImage: BasePage['coverImage'];
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
  category: doc.category,
  coverImage: doc.coverImage,
  blocks: doc.blocks,
  createdAt: toIso(doc.createdAt) as unknown as BasePage['createdAt'],
  updatedAt: toIso(doc.updatedAt) as unknown as BasePage['updatedAt']
});

const getBySlug = async (model: Model<BasePage>, slug: string): Promise<BasePage | null> => {
  await dbConnect();
  const doc = await model.findOne({ slug }).lean<DbPage>();
  return doc ? toEntity(doc) : null;
};

const buildMongoUpdateQuery = (prefix: string, patch: Patch): { $set?: JsonObject; $unset?: JsonObject } => {
  const updateQuery: { $set?: JsonObject; $unset?: JsonObject } = {};

  if (patch.$set && Object.keys(patch.$set).length) {
    updateQuery.$set = Object.fromEntries(Object.entries(patch.$set).map(([k, v]) => [`${prefix}.${k}`, v]));
  }
  if (patch.$unset && Object.keys(patch.$unset).length) {
    updateQuery.$unset = Object.fromEntries(Object.entries(patch.$unset).map(([k, v]) => [`${prefix}.${k}`, v]));
  }

  return updateQuery;
};

export const PageRepository = ({ PageModel, DraftPageModel }: PageRepoDeps): PageRepositoryType => {
  return {
    getDraftBySlug: (slug: string) => getBySlug(DraftPageModel, slug),
    getPublishedBySlug: (slug: string) => getBySlug(PageModel, slug),

    createDraft: async (slug: string, blocks: unknown, source: BasePage): Promise<BasePage> => {
      await dbConnect();
      const newDraft = await new DraftPageModel({
        slug,
        status: PageStatus.Draft,
        title: source.title,
        pageType: source.pageType,
        blocks
      }).save();

      return toEntity(newDraft.toObject() as unknown as DbPage);
    },

    applyPatchToDraft: async (slug: string, patch: Patch): Promise<BasePage> => {
      await dbConnect();
      const updateQuery = buildMongoUpdateQuery('blocks', patch);

      const updated = await DraftPageModel.findOneAndUpdate({ slug }, updateQuery, { new: true }).lean<DbPage>();

      if (!updated) throw new Error('Error during creating draft page');
      return toEntity(updated);
    },

    applyPatchToPublished: async (
      slug: string,
      patch: Patch,
      title: LocalizedTitle,
      pageType: string
    ): Promise<BasePage> => {
      await dbConnect();
      const updateQuery = buildMongoUpdateQuery('blocks', patch);

      updateQuery.$set ??= {};
      updateQuery.$set.title = title;
      updateQuery.$set.pageType = pageType;
      updateQuery.$set.status = PageStatus.Published;

      const updated = await PageModel.findOneAndUpdate(
        { slug },
        updateQuery,
        {
          new: true,
          upsert: true,
          runValidators: true,
          context: 'query',
          strict: false
        }
      ).lean<DbPage>();

      if (!updated) throw new Error('Error during publishing the page');
      return toEntity(updated);
    },

    findPages: async (category?: PageCategory) => {
      await dbConnect();
      const query: FilterQuery<DbPage> = {};
      if (category) query.category = category;

      const docs = await PageModel.find(query).lean<DbPage[]>();
      return docs.map(toEntity);
    },
  };
};
