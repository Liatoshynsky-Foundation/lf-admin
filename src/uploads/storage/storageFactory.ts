import { UPLOAD_ERRORS } from '../errors';
import { createAzureBlobStorage } from './azureBlobStorage';
import { createCloudStorage } from './cloudStorage';
import {StorageAdapter, StorageConfig, StorageType} from './types';

export const createStorageAdapter = (config: StorageConfig): StorageAdapter => {
  /* prettier-ignore */
  switch (config.type) {
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
    const creds = config.cloudConfig.credentials;

    return createCloudStorage({
      provider: config.cloudProvider,
      bucket: config.cloudConfig.bucket || '',
      region: config.cloudConfig.region,
      endpoint: config.cloudConfig.endpoint,
      credentials: {
        accessKeyId: creds?.accessKeyId,
        secretAccessKey: creds?.secretAccessKey,
        token: creds?.token,
        projectId: creds?.projectId
      },
      baseUrl: config.baseUrl
    });

  default:
    throw new Error(UPLOAD_ERRORS.UNKNOWN_STORAGE_TYPE(config.type));
  }
};

export const createStorageFromEnv = (): StorageAdapter => {
  const storageType = (process.env.STORAGE_TYPE || 'cloud') as StorageType;

  const config: StorageConfig = {
    type: storageType,
    baseUrl: process.env.STORAGE_BASE_URL
  };

  /* prettier-ignore */
  switch (storageType) {
  case 'azure-blob':
    config.azureContainerName = process.env.AZURE_CONTAINER_NAME;
    config.azureFolderPrefix = process.env.AZURE_FOLDER_PREFIX || 'uploads';
    break;

  case 'cloud':
    config.cloudProvider = (process.env.CLOUD_PROVIDER || 'aws') as StorageConfig['cloudProvider'];
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
