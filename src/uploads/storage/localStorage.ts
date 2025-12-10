import * as fs from 'fs/promises';
import * as path from 'path';

import { UPLOAD_ERRORS } from '../errors';
import { DeleteResult, StorageAdapter, StorageMetadata, StorageResult } from './types';

export interface LocalStorageOptions {
  basePath: string;
  baseUrl?: string;
}

export const createLocalStorage = (options: LocalStorageOptions): StorageAdapter => {
  const { basePath, baseUrl } = options;

  const ensureDirectory = async (): Promise<void> => {
    try {
      await fs.access(basePath);
    } catch {
      await fs.mkdir(basePath, { recursive: true });
    }
  };

  const getFilePath = (filename: string): string => {
    return path.join(basePath, filename);
  };

  const getMetadataPath = (filename: string): string => {
    return path.join(basePath, `${filename}.meta.json`);
  };

  const store = async (
    buffer: Buffer,
    filename: string,
    mimeType: string,
    metadata: Record<string, any> = {}
  ): Promise<StorageResult> => {
    try {
      await ensureDirectory();

      const filePath = getFilePath(filename);
      const metadataPath = getMetadataPath(filename);

      await fs.writeFile(filePath, buffer);

      const fileMetadata: StorageMetadata = {
        filename,
        originalName: metadata.originalName || filename,
        mimeType,
        size: buffer.length,
        uploadedAt: new Date(),
        path: filePath,
        url: baseUrl ? `${baseUrl}/${filename}` : undefined,
        ...metadata
      };

      await fs.writeFile(metadataPath, JSON.stringify(fileMetadata, null, 2));

      return {
        success: true,
        metadata: fileMetadata
      };
    } catch (error) {
      return {
        success: false,
        metadata: {
          filename,
          originalName: metadata.originalName || filename,
          mimeType,
          size: buffer.length,
          uploadedAt: new Date()
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const retrieve = async (filename: string): Promise<Buffer | null> => {
    try {
      const filePath = getFilePath(filename);
      const buffer = await fs.readFile(filePath);
      return buffer;
    } catch {
      return null;
    }
  };

  const deleteFile = async (filename: string): Promise<DeleteResult> => {
    try {
      const filePath = getFilePath(filename);
      const metadataPath = getMetadataPath(filename);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.log(error);
        throw new Error(UPLOAD_ERRORS.FILE_NOT_FOUND_OR_COULD_NOT_BE_DELETED);
      }

      try {
        await fs.unlink(metadataPath);
      } catch (error) {
        console.log(error);
        throw new Error(UPLOAD_ERRORS.METADATA_NOT_FOUND_OR_COULD_NOT_BE_DELETED);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const exists = async (filename: string): Promise<boolean> => {
    try {
      const filePath = getFilePath(filename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  };

  const getMetadata = async (filename: string): Promise<StorageMetadata | null> => {
    try {
      const metadataPath = getMetadataPath(filename);
      const data = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  const getUrl = (filename: string): string | null => {
    return baseUrl ? `${baseUrl}/${filename}` : null;
  };

  return {
    store,
    retrieve,
    delete: deleteFile,
    exists,
    getMetadata,
    getUrl
  };
};
