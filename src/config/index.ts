export const mongoUrl = process.env.MONGO_URL ?? '';

export const getJWT = {
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ?? 'your-access-secret',
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET ?? 'your-refresh-secret'
};

// Uploads Module Configuration
export type StorageType = 'local' | 'docker' | 'cloud' | 'azure-blob';
export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'cloudflare';

export interface StorageConfig {
  type: StorageType;
  localPath?: string;
  dockerVolume?: string;
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
  environment: 'development' | 'production';
}

const environment = process.env.STORAGE_ENV === 'production' ? 'production' : 'development';

const defaultStorageType: StorageType = environment === 'production' ? 'cloud' : 'local';
const defaultLocalPath = environment === 'development' ? './public/uploads' : undefined;
const defaultCloudProvider: CloudProvider = 'aws';

const storageConfig: StorageConfig = {
  type: (process.env.STORAGE_TYPE as StorageType) || defaultStorageType,
  localPath: process.env.LOCAL_PATH || defaultLocalPath,
  dockerVolume: process.env.DOCKER_VOLUME,
  cloudProvider:
    (process.env.CLOUD_PROVIDER as CloudProvider) || (environment === 'production' ? defaultCloudProvider : undefined),
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
  baseUrl:
    process.env.STORAGE_BASE_URL ||
    (environment === 'development' && (process.env.STORAGE_TYPE as StorageType) === 'local'
      ? 'http://localhost:3000/uploads'
      : undefined)
};

const uploadsConfig: UploadConfig = {
  storage: storageConfig,
  maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '10485760', 10), // 10MB default
  maxFiles: parseInt(process.env.UPLOAD_MAX_FILES || '10', 10)
};

export const config: Config = {
  mongoUrl,
  jwt: getJWT,
  uploads: uploadsConfig,
  environment
};
