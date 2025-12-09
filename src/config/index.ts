export const mongoUrl = process.env.MONGO_URL ?? '';

export const getJWT = {
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ?? 'your-access-secret',
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET ?? 'your-refresh-secret'
};

// Uploads Module Configuration
export type StorageType = 'local' | 'docker' | 'cloud';
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
  baseUrl?: string;
}

export interface UploadConfig {
  development: StorageConfig;
  production: StorageConfig;
  maxFileSize: number;
  maxFiles: number;
}

export interface Config {
  mongoUrl: string;
  jwt: typeof getJWT;
  uploads: UploadConfig;
  environment: 'development' | 'production';
}

const isDevelopment = process.env.NODE_ENV !== 'production';

const developmentStorage: StorageConfig = {
  type: (process.env.DEV_STORAGE_TYPE as StorageType) || 'local',
  localPath: process.env.DEV_LOCAL_PATH || './public/uploads',
  dockerVolume: process.env.DEV_DOCKER_VOLUME,
  cloudProvider: process.env.DEV_CLOUD_PROVIDER as CloudProvider,
  cloudConfig: {
    bucket: process.env.DEV_CLOUD_BUCKET,
    region: process.env.DEV_CLOUD_REGION,
    endpoint: process.env.DEV_CLOUD_ENDPOINT,
    accessKey: process.env.DEV_CLOUD_ACCESS_KEY,
    secretKey: process.env.DEV_CLOUD_SECRET_KEY,
    projectId: process.env.DEV_CLOUD_PROJECT_ID
  },
  baseUrl: process.env.DEV_STORAGE_BASE_URL || 'http://localhost:3000/uploads'
};

const productionStorage: StorageConfig = {
  type: (process.env.PROD_STORAGE_TYPE as StorageType) || 'cloud',
  localPath: process.env.PROD_LOCAL_PATH,
  dockerVolume: process.env.PROD_DOCKER_VOLUME,
  cloudProvider: (process.env.PROD_CLOUD_PROVIDER as CloudProvider) || 'aws',
  cloudConfig: {
    bucket: process.env.PROD_CLOUD_BUCKET,
    region: process.env.PROD_CLOUD_REGION,
    endpoint: process.env.PROD_CLOUD_ENDPOINT,
    accessKey: process.env.PROD_CLOUD_ACCESS_KEY,
    secretKey: process.env.PROD_CLOUD_SECRET_KEY,
    projectId: process.env.PROD_CLOUD_PROJECT_ID
  },
  baseUrl: process.env.PROD_STORAGE_BASE_URL
};

const uploadsConfig: UploadConfig = {
  development: developmentStorage,
  production: productionStorage,
  maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '10485760', 10), // 10MB default
  maxFiles: parseInt(process.env.UPLOAD_MAX_FILES || '10', 10)
};

export const config: Config = {
  mongoUrl,
  jwt: getJWT,
  uploads: uploadsConfig,
  environment: isDevelopment ? 'development' : 'production'
};
