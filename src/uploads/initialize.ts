import { Config } from '../config';
import { createStorageAdapter, StorageConfig } from '../uploads/storage';
import { createUploadController } from '../uploads/uploadController';
import { createUploadService } from '../uploads/uploadService';
import { DEFAULT_IMAGE_RULES } from '../uploads/validators';

export const initializeUploadModule = (config: Config) => {
  // Select storage configuration based on environment
  const currentStorageConfig =
    config.environment === 'production' ? config.uploads.production : config.uploads.development;

  const storageConfig: StorageConfig = {
    type: currentStorageConfig.type
  };

  /* prettier-ignore */
  switch (currentStorageConfig.type) {
  case 'local':
    storageConfig.localPath = currentStorageConfig.localPath;
    storageConfig.baseUrl = currentStorageConfig.baseUrl;
    break;
  case 'docker':
    storageConfig.dockerVolume = currentStorageConfig.dockerVolume;
    storageConfig.baseUrl = currentStorageConfig.baseUrl;
    break;
  case 'cloud':
    storageConfig.cloudProvider = currentStorageConfig.cloudProvider;
    storageConfig.cloudConfig = {
      bucket: currentStorageConfig.cloudConfig?.bucket || '',
      region: currentStorageConfig.cloudConfig?.region,
      endpoint: currentStorageConfig.cloudConfig?.endpoint,
      credentials: {
        accessKeyId: currentStorageConfig.cloudConfig?.accessKey,
        secretAccessKey: currentStorageConfig.cloudConfig?.secretKey,
        projectId: currentStorageConfig.cloudConfig?.projectId
      }
    };
    storageConfig.baseUrl = currentStorageConfig.baseUrl;
    break;
  }

  const storage = createStorageAdapter(storageConfig);

  const uploadService = createUploadService({
    storage,
    defaultFileType: 'image',
    defaultValidationRules: DEFAULT_IMAGE_RULES
  });

  const controller = createUploadController({
    uploadService
  });

  return {
    uploadService,
    controller,
    uploadLimits: {
      fileSize: config.uploads.maxFileSize,
      files: config.uploads.maxFiles
    },
    storageInfo: {
      environment: config.environment,
      storageType: currentStorageConfig.type,
      storageProvider: currentStorageConfig.type === 'cloud' ? currentStorageConfig.cloudProvider : undefined
    }
  };
};
