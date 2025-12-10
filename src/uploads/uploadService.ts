import { UPLOAD_ERRORS } from './errors';
import { createProcessor, FileProcessor } from './processors';
import { StorageAdapter } from './storage';
import { UploadedFile, UploadOptions, UploadResult } from './types';
import { generateUniqueFilename } from './utils';
import { createValidator, FileValidator } from './validators';

export interface UploadServiceConfig {
  storage: StorageAdapter;
  defaultFileType?: 'image' | 'document' | 'video' | 'audio' | 'generic';
  defaultValidationRules?: Record<string, any>;
  defaultProcessingOptions?: Record<string, any>;
}

export const createUploadService = (config: UploadServiceConfig) => {
  const { storage, defaultFileType = 'image', defaultValidationRules, defaultProcessingOptions } = config;

  const uploadFile = async (file: UploadedFile, options: UploadOptions = {}): Promise<UploadResult> => {
    try {
      const fileType = options.fileType || defaultFileType;

      const validationRules = {
        ...defaultValidationRules,
        ...options.validationRules
      };
      const validator: FileValidator = createValidator({
        fileType,
        rules: validationRules
      });

      const validationResult = await validator.validate(file.buffer, file.originalname, file.mimetype);

      if (!validationResult.valid) {
        return {
          success: false,
          errors: validationResult.errors
        };
      }

      const processingOptions = {
        ...defaultProcessingOptions,
        ...options.processingOptions
      };

      const processorType = fileType === 'generic' ? 'none' : fileType;

      const processor: FileProcessor = createProcessor({
        type: processorType,
        options: processingOptions
      });

      const processingResult = await processor.process(
        file.buffer,
        file.originalname,
        file.mimetype,
        processingOptions
      );

      if (!processingResult.success) {
        return {
          success: false,
          errors: processingResult.errors
        };
      }

      const generateFilename = options.generateFilename || generateUniqueFilename;
      const filename = generateFilename(file.originalname, file.mimetype);

      const storageResult = await storage.store(processingResult.buffer, filename, file.mimetype, {
        originalName: file.originalname,
        ...options.metadata,
        ...processingResult.metadata
      });

      if (!storageResult.success) {
        return {
          success: false,
          errors: [storageResult.error || UPLOAD_ERRORS.STORAGE_FAILED]
        };
      }

      return {
        success: true,
        filename: storageResult.metadata.filename,
        originalName: file.originalname,
        url: storageResult.metadata.url,
        size: storageResult.metadata.size,
        mimeType: file.mimetype,
        metadata: storageResult.metadata
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : UPLOAD_ERRORS.UNKNOWN_ERROR]
      };
    }
  };

  const uploadFiles = async (files: UploadedFile[], options: UploadOptions = {}): Promise<UploadResult[]> => {
    const results = await Promise.all(files.map((file) => uploadFile(file, options)));
    return results;
  };

  const retrieveFile = async (filename: string): Promise<Buffer | null> => {
    return storage.retrieve(filename);
  };

  const deleteFile = async (filename: string): Promise<boolean> => {
    const result = await storage.delete(filename);
    return result.success;
  };

  const fileExists = async (filename: string): Promise<boolean> => {
    return storage.exists(filename);
  };

  const getFileMetadata = async (filename: string) => {
    return storage.getMetadata(filename);
  };

  const getFileUrl = (filename: string): string | null => {
    return storage.getUrl(filename);
  };

  return {
    uploadFile,
    uploadFiles,
    retrieveFile,
    deleteFile,
    fileExists,
    getFileMetadata,
    getFileUrl
  };
};

export type UploadService = ReturnType<typeof createUploadService>;
