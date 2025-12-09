import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';

import { DeleteResult, StorageAdapter, StorageMetadata, StorageResult } from './types';

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
    [key: string]: any;
  };
  baseUrl?: string;
}

export const createCloudStorage = (options: CloudStorageOptions): StorageAdapter => {
  const { provider, bucket, region, endpoint, credentials, baseUrl } = options;

  let s3Client: S3Client | null = null;

  if (provider === 'aws' || provider === 'cloudflare') {
    if (!credentials?.accessKeyId || !credentials?.secretAccessKey) {
      throw new Error(`${provider} storage requires accessKeyId and secretAccessKey`);
    }

    const clientConfig: any = {
      region: region || 'auto',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    };

    if (provider === 'cloudflare') {
      if (!endpoint) {
        throw new Error('Cloudflare R2 storage requires endpoint configuration');
      }
      clientConfig.endpoint = endpoint;
    }

    s3Client = new S3Client(clientConfig);
  }

  const store = async (
    buffer: Buffer,
    filename: string,
    mimeType: string,
    metadata: Record<string, any> = {}
  ): Promise<StorageResult> => {
    try {
      if (provider === 'aws' || provider === 'cloudflare') {
        if (!s3Client) {
          throw new Error('S3 client not initialized');
        }

        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: filename,
          Body: buffer,
          ContentType: mimeType,
          Metadata: {
            originalName: metadata.originalName || filename,
            uploadedAt: new Date().toISOString(),
            ...metadata
          }
        });

        await s3Client.send(command);

        const storageMetadata: StorageMetadata = {
          filename,
          originalName: metadata.originalName || filename,
          mimeType,
          size: buffer.length,
          uploadedAt: new Date(),
          url: getUrl(filename) || undefined
        };

        return {
          success: true,
          metadata: storageMetadata
        };
      }

      throw new Error(`Cloud storage for ${provider} not yet implemented`);
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
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };

  const retrieve = async (filename: string): Promise<Buffer | null> => {
    try {
      if (provider === 'aws' || provider === 'cloudflare') {
        if (!s3Client) {
          throw new Error('S3 client not initialized');
        }

        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: filename
        });

        const response = await s3Client.send(command);

        if (!response.Body) {
          return null;
        }

        // Convert stream to buffer
        const chunks: Uint8Array[] = [];
        for await (const chunk of response.Body as any) {
          chunks.push(chunk);
        }
        return Buffer.concat(chunks);
      }

      throw new Error(`Cloud storage for ${provider} not yet implemented`);
    } catch (error) {
      console.error(`Failed to retrieve file ${filename}:`, error);
      return null;
    }
  };

  const deleteFile = async (filename: string): Promise<DeleteResult> => {
    try {
      if (provider === 'aws' || provider === 'cloudflare') {
        if (!s3Client) {
          throw new Error('S3 client not initialized');
        }

        const command = new DeleteObjectCommand({
          Bucket: bucket,
          Key: filename
        });

        await s3Client.send(command);

        return {
          success: true
        };
      }

      throw new Error(`Cloud storage for ${provider} not yet implemented`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };

  const exists = async (filename: string): Promise<boolean> => {
    try {
      if (provider === 'aws' || provider === 'cloudflare') {
        if (!s3Client) {
          throw new Error('S3 client not initialized');
        }

        const command = new HeadObjectCommand({
          Bucket: bucket,
          Key: filename
        });

        await s3Client.send(command);
        return true;
      }

      throw new Error(`Cloud storage for ${provider} not yet implemented`);
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const getMetadata = async (filename: string): Promise<StorageMetadata | null> => {
    try {
      if (provider === 'aws' || provider === 'cloudflare') {
        if (!s3Client) {
          throw new Error('S3 client not initialized');
        }

        const command = new HeadObjectCommand({
          Bucket: bucket,
          Key: filename
        });

        const response = await s3Client.send(command);

        return {
          filename,
          originalName: response.Metadata?.originalName || filename,
          mimeType: response.ContentType || 'application/octet-stream',
          size: response.ContentLength || 0,
          uploadedAt: response.LastModified || new Date(),
          url: getUrl(filename) || undefined
        };
      }

      throw new Error(`Cloud storage for ${provider} not yet implemented`);
    } catch (error) {
      console.error(`Failed to get metadata for ${filename}:`, error);
      return null;
    }
  };

  const getUrl = (filename: string): string | null => {
    /* prettier-ignore */
    switch (provider) {
    case 'cloudflare':
      if (baseUrl) {
        return `${baseUrl}/${filename}`;
      }
      if (endpoint) {
        const match = endpoint.match(/https:\/\/(.+?)\.r2\.cloudflarestorage\.com/);
        if (match) {
          return `${endpoint}/${filename}`;
        }
      }
      return `https://${bucket}.r2.dev/${filename}`;
    case 'aws':
      if (baseUrl) {
        return `${baseUrl}/${filename}`;
      }
      const awsRegion = region || 'us-east-1';
      return `https://${bucket}.s3.${awsRegion}.amazonaws.com/${filename}`;
    case 'gcp':
      if (baseUrl) {
        return `${baseUrl}/${filename}`;
      }
      return `https://storage.googleapis.com/${bucket}/${filename}`;
    case 'azure':
      if (baseUrl) {
        return `${baseUrl}/${filename}`;
      }
      return `https://${bucket}.blob.core.windows.net/${filename}`;
    default:
      return null;
    }
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
