import { Config } from '../config';
import logger from '../middleware/logger/logger';
import { createStorageAdapter } from '../uploads/storage';
import { createUploadController } from '../uploads/uploadController';
import { createUploadService } from '../uploads/uploadService';

export const initializeUploadModule = (config: Config) => {
  const storageConfig = config.uploads.storage;
  const storage = createStorageAdapter(storageConfig);

  const storageDetails = `📦 Upload storage: ${storageConfig.type.toUpperCase()}`;
  logger.info(storageDetails);

  const uploadService = createUploadService({
    storage,
    defaultFileType: 'generic',
    defaultValidationRules: {}
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
      storageType: storageConfig.type,
      storageProvider: storageConfig.type === 'cloud' ? storageConfig.cloudProvider : undefined
    }
  };
};
