import { ClientSession, FilterQuery, Model, Types } from 'mongoose';

import { config } from '../../../config';
import { UPLOAD_ERRORS } from '../../../uploads/errors';
import { createStorageAdapter } from '../../../uploads/storage';
import { preserveOriginalFilenameSafely } from '../../../uploads/utils';
import { createBaseRepository } from '../baseRepository/baseRepository';
import {
  AssetAlreadyExistsError,
  type AssetType,
  type AssetUsageRef,
  type CreateAssetData
} from '~/domain/repositories/assetRepository';
import logger from '~/src/middleware/logger/logger';


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

const decodeUrlPathSegment = (segment: string): string => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

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


type AssetUpdateFields = Partial<
  Pick<AssetEntity, 'isStarred' | 'filename' | 'originalname' | 'description' | 'url'>
>;

const INVALID_RENAME_FILENAME_MESSAGE = 'Введіть назву файлу без крапки та розширення';

const joinStoragePath = (folder: string, filename: string): string => {
  return folder ? `${folder}/${filename}` : filename;
};

const getFilenameExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');

  return lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';
};

const validateRenameFilename = (nextFilename: string, currentFilename: string): void => {
  const currentExtension = getFilenameExtension(currentFilename);
  const nextExtension = getFilenameExtension(nextFilename);
  const nextBaseName = nextExtension ? nextFilename.slice(0, -nextExtension.length) : nextFilename;

  if (nextBaseName.includes('.') || nextFilename.startsWith('.') || nextFilename.endsWith('.')) {
    throw new Error(INVALID_RENAME_FILENAME_MESSAGE);
  }

  if (nextExtension !== currentExtension) {
    throw new Error(`Розширення файлу має залишатися ${currentExtension || 'порожнім'}`);
  }
};

const getUniqueNames = (...names: Array<string | undefined>): string[] => {
  return Array.from(new Set(names.filter((name): name is string => Boolean(name?.trim()))));
};

export const AssetRepository = ({ AssetModel }: AssetRepoDeps) => {
  const baseRepo = createBaseRepository<AssetEntity, DbAsset, AssetFilters>({
    model: AssetModel,
    toEntity,
    buildQuery: buildAssetQuery,
    getDefaultSort: getAssetSort
  });

  const updateAsset = async (id: string, data: UpdateAssetData): Promise<AssetEntity | null> => {
    let updateData: AssetUpdateFields = { ...data };

    if (typeof data.filename === 'string') {
      const existingDoc = await AssetModel.findById(id);

      if (!existingDoc) {
        return null;
      }

      if (existingDoc.usageRefs && existingDoc.usageRefs.length > 0) {
        throw new Error('Cannot rename: file is in use on the site.');
      }

      const nextFilename = preserveOriginalFilenameSafely(data.filename, existingDoc.mimeType);
      const { filename: currentStorageFilename, folder } = getCloudStoragePath(existingDoc);
      validateRenameFilename(nextFilename, currentStorageFilename);

      if (nextFilename !== currentStorageFilename) {
        const fileAlreadyExists = await storage.exists(nextFilename, folder);

        if (fileAlreadyExists) {
          throw new Error(UPLOAD_ERRORS.FILE_ALREADY_EXISTS(nextFilename));
        }

        const storageResult = await storage.move(currentStorageFilename, nextFilename, folder);

        if (!storageResult.success) {
          logger.warn(`Failed to rename file in Cloudflare: ${storageResult.error}`);
          throw new Error('The file was not renamed in cloud storage. Please try again later.');
        }
      }

      updateData = {
        ...updateData,
        filename: nextFilename,
        originalname: nextFilename,
        url: storage.getUrl(joinStoragePath(folder, nextFilename)) ?? existingDoc.url
      };
    }

    const updatedDoc = await AssetModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    return updatedDoc ? toEntity(updatedDoc) : null;
  };

  const createAsset = async (data: CreateAssetData, session?: ClientSession): Promise<AssetEntity> => {
    const checkedNames = getUniqueNames(data.filename, data.originalname);
    const storagePath = getCloudStoragePath({
      filename: data.filename,
      url: data.url,
      type: data.type
    } as DbAsset);
    const targetFolder = storagePath.folder;
    const existingAssets = await AssetModel.find({
      $or: [{ filename: { $in: checkedNames } }, { originalname: { $in: checkedNames } }]
    });
    const hasDuplicateAsset = existingAssets.some((asset) => getCloudStoragePath(asset).folder === targetFolder);

    if (hasDuplicateAsset) {
      const filename = data.originalname ?? data.filename;
      throw new AssetAlreadyExistsError(filename, UPLOAD_ERRORS.FILE_ALREADY_EXISTS(filename));
    }

    const storageMetadata = await storage.getMetadata?.(storagePath.filename, storagePath.folder);
    const createdAt = storageMetadata?.uploadedAt ?? new Date();

    const assetData = {
      ...data,
      isStarred: false,
      tags: [],
      usageRefs: [],
      createdAt,
      updatedAt: new Date()
    };
    const newDoc = session
      ? (await AssetModel.create([assetData], { session }))[0]
      : await AssetModel.create(assetData);

    return toEntity(newDoc);
  };

  const findByUrls = async (urls: string[]): Promise<AssetEntity[]> => {
    const assets = await AssetModel.find({ url: { $in: urls } });

    return assets.map(toEntity);
  };

  const getCloudStoragePath = (asset: DbAsset) => {
    let folder = 'uploads';
    let filename = asset.filename;

    try {
      if (asset.url) {
        const urlObj = new URL(asset.url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);

        if (pathParts.length > 0) {
          filename = decodeUrlPathSegment(pathParts.pop() || asset.filename);
          folder = pathParts.length > 0 ? pathParts.map(decodeUrlPathSegment).join('/') : '';
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

  const addUsageRef = async (url: string, ref: AssetUsageRef, session?: ClientSession): Promise<void> => {
    await AssetModel.findOneAndUpdate({ url }, { $addToSet: { usageRefs: ref } }, { session });
  };

  const removeUsageRef = async (url: string, ref: AssetUsageRef, session?: ClientSession): Promise<void> => {
    await AssetModel.findOneAndUpdate({ url }, { $pull: { usageRefs: ref } }, { session });
  };

  return {
    ...baseRepo,
    updateAsset,
    createAsset,
    findByUrls,
    deleteAsset,
    addUsageRef,
    removeUsageRef
  };
};
