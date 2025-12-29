import { ObjectId } from 'mongodb';
import type { FilterQuery, Model } from 'mongoose';

import { createBaseRepository } from '../baseRepository/baseRepository';
import { MediaMentionsServiceErrors } from '~/back-constants/errors';
import {
  MediaMentionEntity,
  MediaMentionEntityRaw,
  MediaMentionFilters,
  MediaMentionFiltersRaw,
  MediaStatus
} from '~/domain/entities/MediaMentions';
import { MediaMentionsRepository } from '~/domain/repositories/mediaMentionsRepository';
import { newError } from '~/interfaces/error';
import { Result, WrapError, WrapSuccess } from '~/types/common';

type MediaMentionDoc = {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
} & MediaMentionEntityRaw;

type MediaMentionRepoDeps = Readonly<{
  MediaMentionsModel: Model<MediaMentionDoc>;
}>;

function mediaMentionQueryBuilder(filters?: MediaMentionFiltersRaw): FilterQuery<MediaMentionDoc> {
  const query: MediaMentionFiltersRaw = {};

  if (!filters) {
    return query;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  return query;
}

function defaultSorting(filters?: MediaMentionFilters): Record<string, 1 | -1> {
  if (!filters) {
    return {};
  }

  const sortBy = filters.sortBy ?? 'createdAt';
  const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

  return { [sortBy]: sortOrder };
}

function toEntity(doc: MediaMentionDoc): MediaMentionEntity {
  return {
    id: doc._id.toHexString(),
    url: doc.url,
    title: doc.title,
    description: doc.description,
    slug: doc.slug,
    coverImage: doc.coverImage,
    status: doc.status,
    meta: doc.meta,
    publishedAt: doc.publishedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

export function newMediaMentionRepository({ MediaMentionsModel }: MediaMentionRepoDeps): MediaMentionsRepository {
  const baseRepo = createBaseRepository<MediaMentionEntity, MediaMentionDoc, MediaMentionFilters>({
    model: MediaMentionsModel,
    toEntity,
    buildQuery: mediaMentionQueryBuilder,
    getDefaultSort: defaultSorting
  });

  return {
    ...baseRepo,
    async create(mention: Omit<MediaMentionEntityRaw, 'status'>): Promise<Result<MediaMentionEntity>> {
      try {
        const doc = new MediaMentionsModel({
          ...mention,
          publishedAt: mention.publishedAt || new Date(0),
          status: MediaStatus.DRAFT,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Partial<MediaMentionDoc>);

        const saved = await doc.save();

        return WrapSuccess(toEntity(saved as MediaMentionDoc));
      } catch (e: unknown) {
        if (e instanceof Error) {
          return WrapError(newError(e.message));
        }
        return WrapError(newError('Unknown error during create'));
      }
    },
    async addView(id: string): Promise<Result<number>> {
      try {
        if (!ObjectId.isValid(id)) return WrapError(MediaMentionsServiceErrors.INVALID_ID);
        const updated = await MediaMentionsModel.findByIdAndUpdate(
          id,
          {
            $inc: { 'meta.views': 1 },
            $set: { updatedAt: new Date() }
          },
          { new: true, projection: { 'meta.views': 1 } }
        )
          .lean()
          .exec();

        if (!updated) return WrapError(MediaMentionsServiceErrors.NOT_FOUND);
        const views = updated.meta?.views ?? 0;
        return WrapSuccess(views);
      } catch (e: unknown) {
        if (e instanceof Error) {
          return WrapError(newError(e.message));
        }
        return WrapError(newError('Unknown error during addView'));
      }
    }
  };
}
