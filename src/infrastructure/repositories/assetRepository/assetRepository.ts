import { FilterQuery, Model, Types } from 'mongoose';

import { createBaseRepository } from '../baseRepository/baseRepository';

type AssetType = 'image' | 'pdf' | 'audio' | 'document' | 'spreadsheet' | 'video';

type AssetUsageRef = {
  pageId?: string;
  blockId?: string;
};

export type AssetEntity = {
  id: string;
  type: AssetType;
  tags: string[];
  usageRefs: AssetUsageRef[];
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdBy?: string;
  description?: string;
  isStarred: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AssetFilters = {
  type?: AssetType;
  isStarred?: boolean;
  tag?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'filename';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  skip?: number;
};

type DbAsset = {
  _id: Types.ObjectId;
  type: AssetType;
  tags: string[];
  usageRefs: AssetUsageRef[];
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdBy?: Types.ObjectId;
  description?: string;
  isStarred: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type AssetRepoDeps = Readonly<{
  AssetModel: Model<DbAsset>;
}>;

const dateToIso = (date?: Date | string | null): string => {
  if (!date) {
    return new Date(0).toISOString();
  }

  return date instanceof Date ? date.toISOString() : date;
};

const toEntity = (doc: DbAsset): AssetEntity => ({
  id: doc._id.toString(),
  type: doc.type,
  tags: doc.tags,
  usageRefs: doc.usageRefs,
  filename: doc.filename,
  mimeType: doc.mimeType,
  sizeBytes: doc.sizeBytes,
  url: doc.url,
  createdBy: doc.createdBy?.toString(),
  description: doc.description,
  isStarred: doc.isStarred,
  createdAt: dateToIso(doc.createdAt),
  updatedAt: dateToIso(doc.updatedAt)
});

const buildAssetQuery = (
  filters?: Omit<AssetFilters, 'limit' | 'skip' | 'sortBy' | 'sortOrder'>
): FilterQuery<DbAsset> => {
  const query: FilterQuery<DbAsset> = {};

  if (!filters) {
    return query;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (typeof filters.isStarred === 'boolean') {
    query.isStarred = filters.isStarred;
  }

  if (filters.tag) {
    query.tags = filters.tag;
  }

  if (filters.search?.trim()) {
    query.filename = new RegExp(filters.search.trim(), 'i');
  }

  return query;
};

const getAssetSort = (filters?: AssetFilters): Record<string, 1 | -1> => {
  const sortBy = filters?.sortBy ?? 'createdAt';
  const sortOrder = filters?.sortOrder ?? 'desc';

  return {
    [sortBy]: sortOrder === 'asc' ? 1 : -1
  };
};

export const AssetRepository = ({ AssetModel }: AssetRepoDeps) =>
  createBaseRepository<AssetEntity, DbAsset, AssetFilters>({
    model: AssetModel,
    toEntity,
    buildQuery: buildAssetQuery,
    getDefaultSort: getAssetSort
  });
