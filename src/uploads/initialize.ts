import { Config } from '../config';
import { createStorageAdapter, StorageConfig } from '../uploads/storage';
import { createUploadController } from '../uploads/uploadController';
import { createUploadService } from '../uploads/uploadService';
import { DEFAULT_IMAGE_RULES } from '../uploads/validators';

export const initializeUploadModule = (config: Config) => {
  const storageConfig: StorageConfig = {
    type: config.uploads.storageType
  };

  /* prettier-ignore */
  switch (config.uploads.storageType) {
  case 'local':
    storageConfig.localPath = config.uploads.localPath;
    storageConfig.baseUrl = config.uploads.baseUrl;
    break;
  case 'docker':
    storageConfig.dockerVolume = config.uploads.dockerVolume;
    storageConfig.baseUrl = config.uploads.baseUrl;
    break;
  case 'cloud':
    storageConfig.cloudProvider = config.uploads.cloudProvider;
    storageConfig.cloudConfig = {
      bucket: config.uploads.cloudConfig?.bucket || '',
      region: config.uploads.cloudConfig?.region,
      endpoint: config.uploads.cloudConfig?.endpoint,
      credentials: {
        accessKeyId: config.uploads.cloudConfig?.accessKey,
        secretAccessKey: config.uploads.cloudConfig?.secretKey,
        projectId: config.uploads.cloudConfig?.projectId
      }
    };
    // Only use cloudBaseUrl for cloud storage, not the local baseUrl
    storageConfig.baseUrl = config.uploads.cloudBaseUrl;
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
    }
  };
};
