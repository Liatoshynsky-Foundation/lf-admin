import { ClientSession } from 'mongoose';

export type AssetType = 'image' | 'pdf' | 'audio' | 'document' | 'spreadsheet' | 'video' | 'archive';

export type AssetUsageRef = {
  pageId?: string;
  compositionId?: string;
  blockId?: string;
  locale?: string;
};

export type Asset = {
  id: string;
  type: AssetType;
  tags: string[];
  usageRefs: AssetUsageRef[];
  filename: string;
  originalname?: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  isStarred: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAssetData = Pick<Asset, 'filename' | 'mimeType' | 'sizeBytes' | 'url' | 'type'> & {
  originalname?: string;
  description?: string;
};

export interface IAssetRepository {
  findByUrls(urls: string[]): Promise<Asset[]>;
  createAsset(data: CreateAssetData, session?: ClientSession): Promise<Asset>;
  addUsageRef(url: string, ref: AssetUsageRef, session?: ClientSession): Promise<void>;
  removeUsageRef(url: string, ref: AssetUsageRef, session?: ClientSession): Promise<void>;
}

export class AssetAlreadyExistsError extends Error {
  constructor(filename: string, message = `Asset already exists: ${filename}`) {
    super(message);
    this.name = 'AssetAlreadyExistsError';
  }
}
