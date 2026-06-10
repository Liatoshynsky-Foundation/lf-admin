import { FilterQuery, Model, Types } from 'mongoose';
import * as path from 'node:path';

import { config } from '../../../config';
import { createStorageAdapter } from '../../../uploads/storage';
import { createBaseRepository } from '../baseRepository/baseRepository';
import logger from '~/src/middleware/logger/logger';

type AssetType = 'image' | 'pdf' | 'audio' | 'document' | 'spreadsheet' | 'video' | 'archive';

type AssetUsageRef = {
  pageId?: string;
  blockId?: string;
  locale?: string;
};

export type AssetEntity = {
  id: string;
  type: AssetType;
  tags: string[];
  usageRefs: AssetUsageRef[];
  filename: string;
  originalname?: string;
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
  isUsed?: boolean;
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
  originalname?: string;
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

const storage = createStorageAdapter(config.uploads.storage);

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
  originalname: doc.originalname,
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

  if (typeof filters.isUsed === 'boolean') {
    (query as Record<string, unknown>)['usageRefs.0'] = { $exists: filters.isUsed };
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

export type UpdateAssetData = Partial<Pick<AssetEntity, 'isStarred' | 'filename' | 'description'>>;

export type CreateAssetData = {
  filename: string;
  originalname?: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  type: AssetType;
  description?: string;
};

export const AssetRepository = ({ AssetModel }: AssetRepoDeps) => {
  const baseRepo = createBaseRepository<AssetEntity, DbAsset, AssetFilters>({
    model: AssetModel,
    toEntity,
    buildQuery: buildAssetQuery,
    getDefaultSort: getAssetSort
  });

  const updateAsset = async (id: string, data: UpdateAssetData): Promise<AssetEntity | null> => {
    if (data.filename) {
      const existingDoc = await AssetModel.findById(id);

      if (existingDoc) {
        const originalExt = path.extname(existingDoc.filename);

        const safeBaseName = path.parse(data.filename).name;

        data.filename = `${safeBaseName}${originalExt}`;
      }
    }

    const updatedDoc = await AssetModel.findByIdAndUpdate(id, { $set: data }, { new: true });

    return updatedDoc ? toEntity(updatedDoc) : null;
  };

  const createAsset = async (data: CreateAssetData): Promise<AssetEntity> => {
    const newDoc = await AssetModel.create({
      ...data,
      isStarred: false,
      tags: [],
      usageRefs: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return toEntity(newDoc);
  };

  const getCloudStoragePath = (asset: DbAsset) => {
    let folder = 'uploads';
    let filename = asset.filename;

    try {
      if (asset.url) {
        const urlObj = new URL(asset.url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);

        if (pathParts.length > 0) {
          filename = pathParts.pop() || asset.filename;
          folder = pathParts.length > 0 ? pathParts.join('/') : '';
        }
      }
    } catch {
      if (asset.type === 'image') folder = 'photos';
      if (asset.type === 'audio') folder = 'compositions';
    }

    return { filename, folder };
  };

  const deleteAsset = async (id: string): Promise<boolean> => {
    const asset = await AssetModel.findById(id);

    if (!asset) {
      throw new Error('Файл не знайдено');
    }

    if (asset.usageRefs && asset.usageRefs.length > 0) {
      throw new Error('Cannot delete: file is in use on the site.');
    }

    const { filename, folder } = getCloudStoragePath(asset);

    const storageResult = await storage.delete(filename, folder);

    if (!storageResult.success) {
      logger.warn(`Failed to delete file from Cloudflare: ${storageResult.error}`);
      throw new Error('The file was not deleted from cloud storage. Please try again later.');
    }

    await AssetModel.findByIdAndDelete(id);

    return true;
  };

  const addUsageRef = async (url: string, ref: AssetUsageRef): Promise<void> => {
    await AssetModel.findOneAndUpdate({ url }, { $addToSet: { usageRefs: ref } });
  };

  return {
    ...baseRepo,
    updateAsset,
    createAsset,
    deleteAsset,
    addUsageRef
  };
};
