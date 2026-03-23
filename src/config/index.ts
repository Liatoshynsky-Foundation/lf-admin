// src/config/index.ts
import {
  StorageConfig,
  StorageType} from '../uploads/storage/types';

export const mongoUrl = process.env.MONGO_URL ?? '';

export const getJWT = {
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ?? 'your-access-secret',
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET ?? 'your-refresh-secret'
};

export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'cloudflare';

export interface UploadConfig {
  storage: StorageConfig;
  maxFileSize: number;
  maxFiles: number;
}

export interface Config {
  mongoUrl: string;
  jwt: typeof getJWT;
  uploads: UploadConfig;
}

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_MAX_FILES = 10;

const DEFAULT_STORAGE_TYPE: StorageType = 'cloud';
const DEFAULT_CLOUD_PROVIDER: CloudProvider = 'cloudflare';

const storageConfig: StorageConfig = {
  type: (process.env.STORAGE_TYPE as StorageType) || DEFAULT_STORAGE_TYPE,
  cloudProvider: (process.env.CLOUD_PROVIDER as CloudProvider) || DEFAULT_CLOUD_PROVIDER,
  cloudConfig: {
    bucket: process.env.CLOUD_BUCKET,
    region: process.env.CLOUD_REGION,
    endpoint: process.env.CLOUD_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUD_ACCESS_KEY,
      secretAccessKey: process.env.CLOUD_SECRET_KEY,
      projectId: process.env.CLOUD_PROJECT_ID
    }
  },
  azureContainerName: process.env.AZURE_CONTAINER_NAME,
  azureFolderPrefix: process.env.AZURE_FOLDER_PREFIX || 'uploads',
  baseUrl: process.env.STORAGE_BASE_URL
};

const uploadsConfig: UploadConfig = {
  storage: storageConfig,
  maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || String(DEFAULT_MAX_FILE_SIZE), 10),
  maxFiles: parseInt(process.env.UPLOAD_MAX_FILES || String(DEFAULT_MAX_FILES), 10)
};

export const config: Config = {
  mongoUrl,
  jwt: getJWT,
  uploads: uploadsConfig
};