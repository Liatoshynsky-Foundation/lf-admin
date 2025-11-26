import { FilterQuery, Model, Types } from 'mongoose';

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
import { error, newError } from '~/interfaces/error';

type MediaMentionDoc = {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
} & MediaMentionEntityRaw;

type MediaMentionRepoDeps = Readonly<{
  model: Model<MediaMentionDoc>;
}>;

function mediaMentionQueryBuilder(filters?: MediaMentionFiltersRaw): FilterQuery<MediaMentionDoc> {
  const query: MediaMentionFiltersRaw = {};

  if (!filters) {
    return query;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.slug) {
    query.slug = filters.slug;
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
    coverImageUrl: doc.coverImageUrl,
    status: doc.status,
    meta: doc.meta,
    publishedAt: doc.publishedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

export function newMediaMentionRepository({ model }: MediaMentionRepoDeps): MediaMentionsRepository {
  const baseRepo = createBaseRepository<MediaMentionEntity, MediaMentionDoc, MediaMentionFilters>({
    model,
    toEntity,
    buildQuery: mediaMentionQueryBuilder,
    getDefaultSort: defaultSorting
  });

  async function changeStatus(id: string, status: MediaStatus): Promise<void | error> {
    try {
      if (!Types.ObjectId.isValid(id)) return MediaMentionsServiceErrors.INVALID_ID;

      const res = await model.updateOne({ _id: id }, { $set: { status, updatedAt: new Date() } }).exec();
      if (res.matchedCount === 0) return MediaMentionsServiceErrors.NOT_FOUND;
      if (res.modifiedCount === 0)
        return status === MediaStatus.PUBLISHED
          ? MediaMentionsServiceErrors.ALREADY_PUBLISHED
          : MediaMentionsServiceErrors.ALREADY_DRAFT;

      return;
    } catch (e: any) {
      return newError(e?.message ?? 'Unknown error during changeStatus');
    }
  }

  return {
    async create(url: string): Promise<MediaMentionEntity | error> {
      try {
        const doc = new model({
          url,
          status: MediaStatus.DRAFT,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Partial<MediaMentionDoc>);
        const saved = await doc.save();
        return toEntity(saved as MediaMentionDoc);
      } catch (e: any) {
        return newError(e?.message ?? 'Unknown error during create');
      }
    },
    async publish(id: string): Promise<void | error> {
      return changeStatus(id, MediaStatus.PUBLISHED);
    },
    async unpublish(id: string): Promise<void | error> {
      return changeStatus(id, MediaStatus.DRAFT);
    },
    async addView(id: string): Promise<void | error> {
      try {
        if (!Types.ObjectId.isValid(id)) return MediaMentionsServiceErrors.INVALID_ID;
        const res = await model
          .updateOne(
            { _id: id },
            {
              $inc: { 'meta.views': 1 },
              $set: { updatedAt: new Date() }
            }
          )
          .exec();

        if (res.matchedCount === 0) return MediaMentionsServiceErrors.NOT_FOUND;
        return;
      } catch (e: any) {
        return newError(e?.message ?? 'Unknown error during addView');
      }
    },
    ...baseRepo
  };
}
