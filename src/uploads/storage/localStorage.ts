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

  const getFilePath = (filename: string, folder?: string): string => {
    return folder ? path.join(basePath, folder, filename) : path.join(basePath, filename);
  };

  const getMetadataPath = (filename: string, folder?: string): string => {
    return folder ? path.join(basePath, folder, `${filename}.meta.json`) : path.join(basePath, `${filename}.meta.json`);
  };

  const store = async (
    buffer: Buffer,
    filename: string,
    mimeType: string,
    metadata: Record<string, any> = {},
    folder?: string
  ): Promise<StorageResult> => {
    try {
      await ensureDirectory();

      if (folder) {
        const folderPath = path.join(basePath, folder);
        await fs.mkdir(folderPath, { recursive: true });
      }

      const filePath = getFilePath(filename, folder);
      const metadataPath = getMetadataPath(filename, folder);

      await fs.writeFile(filePath, buffer);

      const fileMetadata: StorageMetadata = {
        filename,
        originalName: metadata.originalName || filename,
        mimeType,
        size: buffer.length,
        uploadedAt: new Date(),
        path: filePath,
        url: baseUrl ? (folder ? `${baseUrl}/${folder}/${filename}` : `${baseUrl}/${filename}`) : undefined,
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

  const retrieve = async (filename: string, folder?: string): Promise<Buffer | null> => {
    try {
      const filePath = getFilePath(filename, folder);
      const buffer = await fs.readFile(filePath);
      return buffer;
    } catch {
      return null;
    }
  };

  const deleteFile = async (filename: string, folder?: string): Promise<DeleteResult> => {
    try {
      const filePath = getFilePath(filename, folder);
      const metadataPath = getMetadataPath(filename, folder);

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

  const exists = async (filename: string, folder?: string): Promise<boolean> => {
    try {
      const filePath = getFilePath(filename, folder);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  };

  const getMetadata = async (filename: string, folder?: string): Promise<StorageMetadata | null> => {
    try {
      const metadataPath = getMetadataPath(filename, folder);
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
