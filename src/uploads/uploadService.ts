import { UPLOAD_ERRORS } from './errors';
import { StorageAdapter } from './storage';
import { UploadedFile, UploadOptions, UploadResult } from './types';
import { preserveOriginalFilenameSafely } from './utils';
import { createValidator, FileValidator } from './validators';

export interface UploadServiceConfig {
  storage: StorageAdapter;
  defaultFileType?: 'image' | 'document' | 'video' | 'audio' | 'generic';
  defaultValidationRules?: Record<string, unknown> | object;
}

export const createUploadService = (config: UploadServiceConfig) => {
  const { storage, defaultFileType = 'image', defaultValidationRules } = config;

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

      const generateFilename = options.generateFilename || preserveOriginalFilenameSafely;
      const filename = generateFilename(file.originalname, file.mimetype);

      const fileAlreadyExists = await storage.exists(filename, options.directory);
      if (fileAlreadyExists) {
        return {
          success: false,
          errors: [UPLOAD_ERRORS.FILE_ALREADY_EXISTS(filename)],
          statusCode: 409
        };
      }

      const storageMetadata: Record<string, unknown> = {
        originalName: file.originalname,
        ...(options.metadata as Record<string, unknown>)
      };

      if (options.directory) {
        storageMetadata.directory = options.directory;
      }

      const storageResult = await storage.store(file.buffer, filename, file.mimetype, storageMetadata);

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

  const retrieveFile = async (filename: string, folder?: string): Promise<Buffer | null> => {
    return storage.retrieve(filename, folder);
  };

  const deleteFile = async (filename: string, folder?: string): Promise<boolean> => {
    const result = await storage.delete(filename, folder);
    return result.success;
  };

  const fileExists = async (filename: string, folder?: string): Promise<boolean> => {
    return storage.exists(filename, folder);
  };

  const getFileMetadata = async (filename: string, folder?: string) => {
    return storage.getMetadata(filename, folder);
  };

  const getFileUrl = (filename: string): string | null => {
    return storage.getUrl(filename);
  };

  const listFiles = async (folder?: string) => {
    return storage.list(folder);
  };

  return {
    uploadFile,
    uploadFiles,
    retrieveFile,
    deleteFile,
    fileExists,
    getFileMetadata,
    getFileUrl,
    listFiles
  };
};

export type UploadService = ReturnType<typeof createUploadService>;
