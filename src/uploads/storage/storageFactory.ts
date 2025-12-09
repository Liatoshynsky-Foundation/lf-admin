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

export const createStorageFromEnv = (environment: 'development' | 'production' = 'development'): StorageAdapter => {
  const envPrefix = environment === 'production' ? 'PROD' : 'DEV';
  const storageType = (process.env[`${envPrefix}_STORAGE_TYPE`] ||
    (environment === 'production' ? 'cloud' : 'local')) as StorageType;

  const config: StorageConfig = {
    type: storageType,
    baseUrl: process.env[`${envPrefix}_STORAGE_BASE_URL`]
  };

  /* prettier-ignore */
  switch (storageType) {
  case 'local':
    config.localPath = process.env[`${envPrefix}_LOCAL_PATH`] || (environment === 'development' ? './public/uploads' : undefined);
    break;

  case 'docker':
    config.dockerVolume = process.env[`${envPrefix}_DOCKER_VOLUME`] || '/app/uploads';
    break;

  case 'cloud':
    config.cloudProvider = (process.env[`${envPrefix}_CLOUD_PROVIDER`] || 'aws') as any;
    config.cloudConfig = {
      bucket: process.env[`${envPrefix}_CLOUD_BUCKET`],
      region: process.env[`${envPrefix}_CLOUD_REGION`],
      endpoint: process.env[`${envPrefix}_CLOUD_ENDPOINT`],
      credentials: {
        accessKeyId: process.env[`${envPrefix}_CLOUD_ACCESS_KEY`],
        secretAccessKey: process.env[`${envPrefix}_CLOUD_SECRET_KEY`],
        token: process.env[`${envPrefix}_CLOUDFLARE_TOKEN`],
        projectId: process.env[`${envPrefix}_CLOUD_PROJECT_ID`]
      }
    };
    break;
  }

  return createStorageAdapter(config);
};
