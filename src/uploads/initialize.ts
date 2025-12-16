import { Config } from '../config';
import logger from '../middleware/logger/logger';
import { createStorageAdapter, StorageConfig } from '../uploads/storage';
import { createUploadController } from '../uploads/uploadController';
import { createUploadService } from '../uploads/uploadService';
import { DEFAULT_IMAGE_RULES } from '../uploads/validators';

export const initializeUploadModule = (config: Config) => {
  const storageConfig = config.uploads.storage;

  const adapterConfig: StorageConfig = {
    type: storageConfig.type,
    localPath: storageConfig.localPath,
    dockerVolume: storageConfig.dockerVolume,
    azureContainerName: storageConfig.azureContainerName,
    azureFolderPrefix: storageConfig.azureFolderPrefix,
    cloudProvider: storageConfig.cloudProvider,
    /* eslint-disable */
    cloudConfig: storageConfig.cloudConfig
      ? {
          bucket: storageConfig.cloudConfig.bucket || '',
          region: storageConfig.cloudConfig.region,
          endpoint: storageConfig.cloudConfig.endpoint,
          credentials: {
            accessKeyId: storageConfig.cloudConfig.accessKey,
            secretAccessKey: storageConfig.cloudConfig.secretKey,
            projectId: storageConfig.cloudConfig.projectId
          }
        }
      : undefined,
    /* eslint-enable */
    baseUrl: storageConfig.baseUrl
  };

  const storage = createStorageAdapter(adapterConfig);

  const storageDetails = `📦 Upload storage: ${storageConfig.type.toUpperCase()} (${config.environment})`;

  logger.info(storageDetails);

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
      storageType: storageConfig.type,
      storageProvider: storageConfig.type === 'cloud' ? storageConfig.cloudProvider : undefined
    }
  };
};
