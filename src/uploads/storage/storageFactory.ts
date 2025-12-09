import { createCloudStorage } from './cloudStorage';
import { createDockerStorage } from './dockerStorage';
import { createLocalStorage } from './localStorage';
import { StorageAdapter, StorageConfig, StorageType } from './types';

export const createStorageAdapter = (config: StorageConfig): StorageAdapter => {
  /* prettier-ignore */
  switch (config.type) {
  case 'local':
    if (!config.localPath) {
      throw new Error('Local storage requires localPath in config');
    }
    return createLocalStorage({
      basePath: config.localPath,
      baseUrl: config.baseUrl
    });

  case 'docker':
    if (!config.dockerVolume) {
      throw new Error('Docker storage requires dockerVolume in config');
    }
    return createDockerStorage({
      volumePath: config.dockerVolume,
      baseUrl: config.baseUrl
    });

  case 'cloud':
    if (!config.cloudProvider || !config.cloudConfig) {
      throw new Error('Cloud storage requires cloudProvider and cloudConfig');
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
    throw new Error(`Unknown storage type: ${config.type}`);
  }
};

export const createStorageFromEnv = (): StorageAdapter => {
  const storageType = (process.env.STORAGE_TYPE || 'local') as StorageType;

  const config: StorageConfig = {
    type: storageType,
    baseUrl: process.env.STORAGE_BASE_URL
  };

  /* prettier-ignore */
  switch (storageType) {
  case 'local':
    config.localPath = process.env.STORAGE_LOCAL_PATH || './uploads';
    break;

  case 'docker':
    config.dockerVolume = process.env.STORAGE_DOCKER_VOLUME || '/app/uploads';
    break;

  case 'cloud':
    config.cloudProvider = (process.env.STORAGE_CLOUD_PROVIDER || 'aws') as any;
    config.cloudConfig = {
      bucket: process.env.BUCKET_NAME,
      region: process.env.STORAGE_CLOUD_REGION,
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        token: process.env.CLOUDFLARE_TOKEN,
        projectId: process.env.STORAGE_CLOUD_PROJECT_ID
      }
    };
    break;
  }

  return createStorageAdapter(config);
};
