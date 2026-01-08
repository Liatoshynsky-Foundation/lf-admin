import { BlobServiceClient, BlockBlobClient, ContainerClient } from '@azure/storage-blob';

import { UPLOAD_ERRORS } from '../errors';
import { DeleteResult, StorageAdapter, StorageMetadata, StorageResult } from './types';
import { errors } from '~/back-constants/errors';
import { CONTAINER_NAME } from '~/back-constants/index';
import logger from '~/middleware/logger/logger';
import { zContentTypeSchema, zFolderNameSchema } from '~/validators/blob.schema';

export interface AzureBlobStorageOptions {
  containerName?: string;
  baseUrl?: string;
  folderPrefix?: string;
}

export interface AzureBlobStorageAdapter extends StorageAdapter {
  uploadFile: (folderName: string, blobName: string, buffer: Buffer, contentType?: string) => Promise<void>;
  deleteFileFromAzure: (folderName: string, blobName: string) => Promise<void>;
  constructBlobUrl: (folderName: string, blobName: string) => string;
  copyBlobsToNewFolder: (oldFolderName: string, newFolderName: string, blobNames: string[]) => Promise<string[]>;
  streamBlob: (url: string, rangeHeader: string | null) => Promise<Response>;
}

export const createAzureBlobStorage = (options: AzureBlobStorageOptions = {}): AzureBlobStorageAdapter => {
  const { folderPrefix = 'uploads', baseUrl, containerName = CONTAINER_NAME } = options;

  let blobServiceClient: BlobServiceClient | null = null;

  const getClient = (): BlobServiceClient => {
    if (blobServiceClient) {
      return blobServiceClient;
    }
    const { AZURE_SAS_URL } = process.env;
    if (!AZURE_SAS_URL) {
      throw new Error(UPLOAD_ERRORS.AZURE_URL_NOT_DEFINED);
    }
    blobServiceClient = new BlobServiceClient(AZURE_SAS_URL);
    return blobServiceClient;
  };

  const getContainerClient = (): ContainerClient => {
    return getClient().getContainerClient(containerName);
  };

  const getFullPathToBlob = (
    containerClient: ContainerClient,
    folderName: string,
    blobName: string
  ): BlockBlobClient => {
    return containerClient.getBlockBlobClient(`${folderName}/${blobName}`);
  };

  const getBlobClient = (folderName: string, blobName: string): BlockBlobClient => {
    zFolderNameSchema.parse(folderName);
    const containerClient = getContainerClient();
    return getFullPathToBlob(containerClient, folderName, blobName);
  };

  const buildUrl = (filename: string, directory?: string): string => {
    if (baseUrl) {
      return `${baseUrl}/${filename}`;
    }
    return constructBlobUrl(directory || folderPrefix, filename);
  };

  const uploadFile = async (
    folderName: string,
    blobName: string,
    buffer: Buffer,
    contentType?: string
  ): Promise<void> => {
    try {
      zContentTypeSchema.parse(contentType);
      const blockBlobClient = getBlobClient(folderName, blobName);
      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: contentType }
      });
    } catch (error) {
      logger.error(errors.FAILED_TO_UPLOAD_BLOB, error);
      throw error;
    }
  };

  const deleteFileFromAzure = async (folderName: string, blobName: string): Promise<void> => {
    try {
      const blockBlobClient = getBlobClient(folderName, blobName);
      await blockBlobClient.deleteIfExists();
    } catch (error) {
      logger.error(errors.FAILED_TO_DELETE_BLOB, error);
      throw error;
    }
  };

  const constructBlobUrl = (folderName: string, blobName: string): string => {
    try {
      const blockBlobClient = getBlobClient(folderName, blobName);
      return blockBlobClient.url;
    } catch (error) {
      logger.error(errors.BLOB_DOES_NOT_EXIST, error);
      throw error;
    }
  };

  const copyBlobsToNewFolder = async (
    oldFolderName: string,
    newFolderName: string,
    blobNames: string[]
  ): Promise<string[]> => {
    try {
      zFolderNameSchema.parse(oldFolderName);
      zFolderNameSchema.parse(newFolderName);

      const containerClient = getContainerClient();

      return await Promise.all(
        blobNames.map(async (blobName) => {
          const sourceBlobClient = getFullPathToBlob(containerClient, oldFolderName, blobName);
          const targetBlobClient = getFullPathToBlob(containerClient, newFolderName, blobName);

          const copyPoller = await targetBlobClient.beginCopyFromURL(sourceBlobClient.url);
          await copyPoller.pollUntilDone();

          return targetBlobClient.name;
        })
      );
    } catch (error) {
      logger.error(errors.BLOB_DOES_NOT_EXIST, error);
      throw error;
    }
  };

  const streamBlob = async (url: string, rangeHeader: string | null): Promise<Response> => {
    const azureResponse = await fetch(url, {
      method: 'GET',
      headers: rangeHeader ? { Range: rangeHeader } : {},
      next: { revalidate: 0 }
    });

    if (!azureResponse.ok) {
      return new Response(azureResponse.body, {
        status: azureResponse.status,
        statusText: azureResponse.statusText
      });
    }

    const headers = new Headers();
    headers.set('Content-Type', azureResponse.headers.get('Content-Type') ?? 'application/octet-stream');
    headers.set('Content-Length', azureResponse.headers.get('Content-Length') ?? '');
    if (azureResponse.headers.has('Content-Range')) {
      headers.set('Content-Range', azureResponse.headers.get('Content-Range')!);
    }
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=604800, immutable');

    return new Response(azureResponse.body, {
      status: azureResponse.status,
      statusText: azureResponse.statusText,
      headers
    });
  };

  const store = async (
    buffer: Buffer,
    filename: string,
    mimeType: string,
    metadata: Record<string, any> = {}
  ): Promise<StorageResult> => {
    try {
      const directory = metadata.directory || folderPrefix;

      await uploadFile(directory, filename, buffer, mimeType);

      const url = buildUrl(filename, directory);

      const storageMetadata: StorageMetadata = {
        filename,
        originalName: metadata.originalName || filename,
        mimeType,
        size: buffer.length,
        uploadedAt: new Date(),
        path: `${directory}/${filename}`,
        url,
        ...metadata
      };

      return {
        success: true,
        metadata: storageMetadata
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
        error: error instanceof Error ? error.message : UPLOAD_ERRORS.UNKNOWN_ERROR_OCCURRED
      };
    }
  };

  const retrieve = async (filename: string, folder?: string): Promise<Buffer | null> => {
    try {
      const targetFolder = folder || folderPrefix;
      const url = constructBlobUrl(targetFolder, filename);
      const response = await streamBlob(url, null);

      if (!response.ok) {
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error(`Failed to retrieve file ${filename} from Azure:`, error);
      return null;
    }
  };

  const deleteFile = async (filename: string, folder?: string): Promise<DeleteResult> => {
    try {
      const targetFolder = folder || folderPrefix;
      await deleteFileFromAzure(targetFolder, filename);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : UPLOAD_ERRORS.UNKNOWN_ERROR_OCCURRED
      };
    }
  };

  const exists = async (filename: string, folder?: string): Promise<boolean> => {
    try {
      const targetFolder = folder || folderPrefix;
      const blockBlobClient = getBlobClient(targetFolder, filename);
      return await blockBlobClient.exists();
    } catch (error) {
      logger.error(`Failed to check existence of ${filename}:`, error);
      return false;
    }
  };

  const getMetadata = async (filename: string, folder?: string): Promise<StorageMetadata | null> => {
    try {
      const targetFolder = folder || folderPrefix;
      const url = constructBlobUrl(targetFolder, filename);
      const response = await fetch(url, {
        method: 'HEAD'
      });

      if (!response.ok) {
        return null;
      }

      const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
      const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);

      return {
        filename,
        originalName: filename,
        mimeType: contentType,
        size: contentLength,
        uploadedAt: new Date(),
        path: `${targetFolder}/${filename}`,
        url
      };
    } catch (error) {
      console.error(`Failed to get metadata for ${filename}:`, error);
      return null;
    }
  };

  const list = async (folder?: string): Promise<StorageMetadata[]> => {
    try {
      const containerClient = getContainerClient();
      const prefix = folder ? (folder.endsWith('/') ? folder : `${folder}/`) : undefined;

      const blobs: StorageMetadata[] = [];

      for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        const fullPath = blob.name;
        const filename = fullPath.split('/').pop() || fullPath;
        const directory = fullPath.substring(0, fullPath.lastIndexOf('/'));
        const url = containerClient.getBlockBlobClient(blob.name).url;

        blobs.push({
          filename,
          originalName: filename,
          mimeType: blob.properties.contentType || 'application/octet-stream',
          size: blob.properties.contentLength || 0,
          uploadedAt: blob.properties.lastModified || new Date(),
          path: fullPath,
          url,
          directory
        });
      }

      return blobs;
    } catch (error) {
      logger.error('Failed to list blobs', error);
      return [];
    }
  };

  const getUrl = (filename: string): string | null => {
    try {
      if (!baseUrl) {
        try {
          return constructBlobUrl(folderPrefix, filename);
        } catch {
          return null;
        }
      }
      return buildUrl(filename);
    } catch (error) {
      console.error(`Failed to construct URL for ${filename}:`, error);
      return null;
    }
  };

  return {
    store,
    retrieve,
    delete: deleteFile,
    exists,
    getMetadata,
    getUrl,
    uploadFile,
    deleteFileFromAzure,
    constructBlobUrl,
    copyBlobsToNewFolder,
    streamBlob,
    list
  };
};
