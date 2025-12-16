import { UPLOAD_ERRORS } from '../errors';
import { createAzureBlobStorage } from './azureBlobStorage';
import { createCloudStorage } from './cloudStorage';
import { createDockerStorage } from './dockerStorage';
import { createLocalStorage } from './localStorage';
import { StorageAdapter, StorageConfig, StorageType } from './types';

export const createStorageAdapter = (config: StorageConfig): StorageAdapter => {
  /* prettier-ignore */
  switch (config.type) {
  case 'local':
    if (!config.localPath) {
      throw new Error(UPLOAD_ERRORS.LOCAL_STORAGE_REQUIRES_PATH);
    }
    return createLocalStorage({
      basePath: config.localPath,
      baseUrl: config.baseUrl
    });

  case 'docker':
    if (!config.dockerVolume) {
      throw new Error(UPLOAD_ERRORS.DOCKER_STORAGE_REQUIRES_VOLUME);
    }
    return createDockerStorage({
      volumePath: config.dockerVolume,
      baseUrl: config.baseUrl
    });

  case 'azure-blob':
    return createAzureBlobStorage({
      containerName: config.azureContainerName,
      baseUrl: config.baseUrl,
      folderPrefix: config.azureFolderPrefix || 'uploads'
    });

  case 'cloud':
    if (!config.cloudProvider || !config.cloudConfig) {
      throw new Error(UPLOAD_ERRORS.CLOUD_STORAGE_REQUIRES_CONFIG);
    }
    return createCloudStorage({
      provider: config.cloudProvider,
      bucket: config.cloudConfig.bucket || '',
      region: config.cloudConfig.region,
      endpoint: config.cloudConfig.endpoint,
      credentials: config.cloudConfig.credentials,
      baseUrl: config.baseUrl
    });

  default:
    throw new Error(UPLOAD_ERRORS.UNKNOWN_STORAGE_TYPE(config.type));
  }
};

export const createStorageFromEnv = (environment: 'development' | 'production' = 'development'): StorageAdapter => {
  const storageType = (process.env.STORAGE_TYPE || (environment === 'production' ? 'cloud' : 'local')) as StorageType;

  const config: StorageConfig = {
    type: storageType,
    baseUrl: process.env.STORAGE_BASE_URL
  };

  /* prettier-ignore */
  switch (storageType) {
  case 'local':
    config.localPath = process.env.LOCAL_PATH || (environment === 'development' ? './public/uploads' : undefined);
    break;

  case 'docker':
    config.dockerVolume = process.env.DOCKER_VOLUME || '/app/uploads';
    break;

  case 'cloud':
    config.cloudProvider = (process.env.CLOUD_PROVIDER || 'aws') as any;
    config.cloudConfig = {
      bucket: process.env.CLOUD_BUCKET,
      region: process.env.CLOUD_REGION,
      endpoint: process.env.CLOUD_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUD_ACCESS_KEY,
        secretAccessKey: process.env.CLOUD_SECRET_KEY,
        token: process.env.CLOUDFLARE_TOKEN,
        projectId: process.env.CLOUD_PROJECT_ID
      }
    };
    break;
  }

  return createStorageAdapter(config);
};
