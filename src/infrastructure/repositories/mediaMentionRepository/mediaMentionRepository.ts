import mongoose, { Model } from 'mongoose';

import { createBaseRepository } from '../baseRepository/baseRepository';
import {MediaMentionEntity} from '~/domain/entities/MediaMentions';
import {
  CreateMediaMentionInput,
  IMediaMentionsRepository,
  MediaMentionFilters
} from '~/domain/repositories/mediaMentionsRepository';
import dbConnect from '~/infrastructure/db/connect';
import {buildBaseQuery, createToEntity, getBaseSort} from '~/infrastructure/repositories/helpers';
import { MediaStatus } from '~/types/enums/common.enums';

export type DbMediaMention = {
  _id: { toString(): string };
  url: string;
  adminTitle: string;
  title: MediaMentionEntity['title'];
  description: MediaMentionEntity['description'];
  keywords: MediaMentionEntity['keywords'];
  slug: string;
  coverImage: MediaMentionEntity['coverImage'];
  status: MediaStatus;
  allowIndexation: MediaMentionEntity['allowIndexation'];
  meta: MediaMentionEntity['meta'];
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type MediaMentionRepoDeps = Readonly<{
  MediaMentionsModel: Model<DbMediaMention>;
}>;

const toEntity = (doc: DbMediaMention): MediaMentionEntity =>
  createToEntity<MediaMentionEntity, DbMediaMention>(doc, {
    url: doc.url,
    adminTitle: doc.adminTitle,
    title: doc.title,
    description: doc.description,
    keywords: doc.keywords,
    slug: doc.slug,
    coverImage: doc.coverImage,
    status: doc.status,
    allowIndexation: doc.allowIndexation,
    meta: doc.meta,
    publishedAt: doc.publishedAt ?? undefined,
  });

export const MediaMentionsRepository = ({ MediaMentionsModel }: MediaMentionRepoDeps): IMediaMentionsRepository => {
  const baseRepo = createBaseRepository<MediaMentionEntity, DbMediaMention, MediaMentionFilters>({
    model: MediaMentionsModel,
    toEntity,
    buildQuery: (filters) => buildBaseQuery(filters),
    getDefaultSort: getBaseSort
  });

  return {
    ...baseRepo,
    create: async (input: CreateMediaMentionInput): Promise<MediaMentionEntity> => {
      await dbConnect();

      const mentionData = {
        ...input,
        publishedAt: input.publishedAt || new Date(0).toISOString(),
        status: input.status || MediaStatus.Draft,
        meta: {
          views: input.meta?.views ?? 0
        }
      };

      const newMention = await new MediaMentionsModel(mentionData).save();
      return toEntity(newMention.toObject() as unknown as DbMediaMention);
    },

    incrementViews: async (id: string): Promise<MediaMentionEntity | null> => {
      await dbConnect();
      if (!mongoose.Types.ObjectId.isValid(id)) return null;

      const updated = await MediaMentionsModel.findByIdAndUpdate(
        id,
        {
          $inc: { 'meta.views': 1 },
          $set: { updatedAt: new Date().toISOString() }
        },
        { new: true }
      ).lean<DbMediaMention>();

      return updated ? toEntity(updated) : null;
    }
  };
};