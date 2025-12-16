export const mongoUrl = process.env.MONGO_URL ?? '';

export const getJWT = {
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ?? 'your-access-secret',
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET ?? 'your-refresh-secret'
};

// Uploads Module Configuration
export type StorageType = 'cloud' | 'azure-blob';
export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'cloudflare';

export interface StorageConfig {
  type: StorageType;
  cloudProvider?: CloudProvider;
  cloudConfig?: {
    bucket?: string;
    region?: string;
    endpoint?: string;
    accessKey?: string;
    secretKey?: string;
    projectId?: string;
  };
  azureContainerName?: string;
  azureFolderPrefix?: string;
  baseUrl?: string;
}

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

const defaultStorageType: StorageType = 'cloud';
const defaultCloudProvider: CloudProvider = 'aws';

const storageConfig: StorageConfig = {
  type: (process.env.STORAGE_TYPE as StorageType) || defaultStorageType,
  cloudProvider: (process.env.CLOUD_PROVIDER as CloudProvider) || defaultCloudProvider,
  cloudConfig: {
    bucket: process.env.CLOUD_BUCKET,
    region: process.env.CLOUD_REGION,
    endpoint: process.env.CLOUD_ENDPOINT,
    accessKey: process.env.CLOUD_ACCESS_KEY,
    secretKey: process.env.CLOUD_SECRET_KEY,
    projectId: process.env.CLOUD_PROJECT_ID
  },
  azureContainerName: process.env.AZURE_CONTAINER_NAME,
  azureFolderPrefix: process.env.AZURE_FOLDER_PREFIX || 'uploads',
  baseUrl: process.env.STORAGE_BASE_URL
};

const uploadsConfig: UploadConfig = {
  storage: storageConfig,
  maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '10485760', 10), // 10MB default
  maxFiles: parseInt(process.env.UPLOAD_MAX_FILES || '10', 10)
};

export const config: Config = {
  mongoUrl,
  jwt: getJWT,
  uploads: uploadsConfig
};
