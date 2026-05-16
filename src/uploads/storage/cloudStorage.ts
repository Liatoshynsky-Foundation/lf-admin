import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';

import { UPLOAD_ERRORS } from '../errors';
import { DeleteResult, StorageAdapter, StorageMetadata, StorageResult } from './types';
import logger from '~/middleware/logger/logger';

export interface CloudStorageOptions {
  provider: 'aws' | 'gcp' | 'azure' | 'cloudflare';
  bucket: string;
  region?: string;
  endpoint?: string;
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    token?: string;
    projectId?: string;
  };
  baseUrl?: string;
  folderPrefix?: string;
}

export const createCloudStorage = (options: CloudStorageOptions): StorageAdapter => {
  const { provider, bucket, region, endpoint, credentials, baseUrl, folderPrefix = 'uploads' } = options;

  let s3Client: S3Client | null = null;

  const getS3Client = (): S3Client => {
    if (s3Client) return s3Client;

    if (provider === 'aws' || provider === 'cloudflare') {
      if (!credentials?.accessKeyId || !credentials?.secretAccessKey) {
        throw new Error(UPLOAD_ERRORS.CLOUD_STORAGE_REQUIRES_CREDENTIALS(provider));
      }

      const clientConfig = {
        region: region || 'auto',
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey
        },
        endpoint: provider === 'cloudflare' ? endpoint : undefined
      };

      if (provider === 'cloudflare' && !endpoint) {
        throw new Error(UPLOAD_ERRORS.CLOUDFLARE_ENDPOINT_REQUIRED);
      }

      s3Client = new S3Client(clientConfig);
      return s3Client;
    }

    throw new Error(UPLOAD_ERRORS.CLOUD_STORAGE_NOT_IMPLEMENTED(provider));
  };


  const getTargetKey = (filename: string, folder?: string, metadataDir?: unknown): string => {
    const targetFolder = folder || (typeof metadataDir === 'string' ? metadataDir : folderPrefix);
    return `${targetFolder}/${filename}`;
  };

  const store = async (
    buffer: Buffer,
    filename: string,
    mimeType: string,
    metadata: Record<string, unknown> = {}
  ): Promise<StorageResult> => {
    try {
      const client = getS3Client();

      const key = getTargetKey(filename, undefined, metadata.directory);

      const originalName = typeof metadata.originalName === 'string'
        ? metadata.originalName
        : filename;

      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          Metadata: {
            originalName,
            uploadedAt: new Date().toISOString(),
            ...Object.fromEntries(Object.entries(metadata).map(([k, v]) => [k, String(v)]))
          }
        })
      );

      return {
        success: true,
        metadata: {
          filename,
          originalName,
          mimeType,
          size: buffer.length,
          uploadedAt: new Date(),
          path: key,
          url: getUrl(key) || undefined,
          directory: key.substring(0, key.lastIndexOf('/')),
          originalFilename: originalName,
          originalMimeType: mimeType,
          processed: true,
          ...metadata
        }
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : UPLOAD_ERRORS.UNKNOWN_ERROR_OCCURRED;

      const originalName = typeof metadata.originalName === 'string'
        ? metadata.originalName
        : filename;

      return {
        success: false,
        metadata: {
          filename,
          originalName,
          mimeType,
          size: buffer.length,
          uploadedAt: new Date()
        },
        error: errorMsg
      };
    }
  };

  const retrieve = async (filename: string, folder?: string): Promise<Buffer | null> => {
    try {
      if (provider !== 'aws' && provider !== 'cloudflare') return null;
      const client = getS3Client();

      const key = getTargetKey(filename, folder);
      const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

      if (!response.Body) return null;
      const chunks: Uint8Array[] = [];
      const stream = response.Body as AsyncIterable<Uint8Array>;
      for await (const chunk of stream) chunks.push(chunk);
      return Buffer.concat(chunks);
    } catch (error) {
      logger.error(`Failed to retrieve file ${filename}:`, error);
      return null;
    }
  };

  const deleteFile = async (filename: string, folder?: string): Promise<DeleteResult> => {
    try {
      if (provider !== 'aws' && provider !== 'cloudflare') {
        throw new Error(UPLOAD_ERRORS.CLOUD_STORAGE_NOT_IMPLEMENTED(provider));
      }
      const client = getS3Client();

      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: getTargetKey(filename, folder) }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : UPLOAD_ERRORS.UNKNOWN_ERROR_OCCURRED };
    }
  };

  const exists = async (filename: string, folder?: string): Promise<boolean> => {
    try {
      if (provider !== 'aws' && provider !== 'cloudflare') return false;
      const client = getS3Client();

      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: getTargetKey(filename, folder) }));
      return true;
    } catch {
      return false;
    }
  };

  const getMetadata = async (filename: string, folder?: string): Promise<StorageMetadata | null> => {
    try {
      if (provider !== 'aws' && provider !== 'cloudflare') return null;
      const client = getS3Client();

      const key = getTargetKey(filename, folder);
      const response = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));

      const mimeType = response.ContentType || 'application/octet-stream';
      const originalName = response.Metadata?.originalName || filename;

      return {
        filename,
        originalName,
        mimeType,
        size: response.ContentLength || 0,
        uploadedAt: response.LastModified || new Date(),
        path: key,
        url: getUrl(key) || undefined,
        directory: key.substring(0, key.lastIndexOf('/')),
        originalFilename: originalName,
        originalMimeType: mimeType,
        processed: true
      };
    } catch {
      return null;
    }
  };

  const list = async (folder?: string): Promise<StorageMetadata[]> => {
    try {
      const client = getS3Client();

      let prefix = '';
      if (folder) {
        prefix = folder.endsWith('/') ? folder : `${folder}/`;
      }

      const response = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }));

      return (response.Contents || []).map((item) => {
        const itemKey = item.Key || '';
        const itemFilename = itemKey.split('/').pop() || itemKey;

        return {
          filename: itemFilename,
          originalName: itemFilename,
          mimeType: 'application/octet-stream',
          size: item.Size || 0,
          uploadedAt: item.LastModified || new Date(),
          path: itemKey,
          url: getUrl(itemKey) || undefined,
          directory: itemKey.substring(0, itemKey.lastIndexOf('/'))
        };
      });
    } catch {
      return [];
    }
  };

  const getUrl = (filename: string): string | null => {
    const cleanName = filename.startsWith('/') ? filename.substring(1) : filename;
    if (baseUrl) return `${baseUrl}/${cleanName}`;

    switch (provider) {
    case 'cloudflare':
      return endpoint && !endpoint.includes('invalid-endpoint')
        ? `${endpoint}/${cleanName}`
        : `https://${bucket}.r2.dev/${cleanName}`;
    case 'aws':
      return `https://${bucket}.s3.${region || 'us-east-1'}.amazonaws.com/${cleanName}`;
    case 'gcp':
      return `https://storage.googleapis.com/${bucket}/${cleanName}`;
    case 'azure':
      return `https://${bucket}.blob.core.windows.net/${cleanName}`;
    default:
      return null;
    }
  };

  return { store, retrieve, delete: deleteFile, exists, getMetadata, getUrl, list };
};