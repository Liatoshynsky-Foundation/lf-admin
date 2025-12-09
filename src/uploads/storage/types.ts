export interface StorageMetadata {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  path?: string;
  url?: string;
  [key: string]: any;
}

export interface StorageResult {
  success: boolean;
  metadata: StorageMetadata;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export interface StorageAdapter {
  store: (buffer: Buffer, filename: string, mimeType: string, metadata?: Record<string, any>) => Promise<StorageResult>;

  retrieve: (filename: string) => Promise<Buffer | null>;

  delete: (filename: string) => Promise<DeleteResult>;

  exists: (filename: string) => Promise<boolean>;

  getMetadata: (filename: string) => Promise<StorageMetadata | null>;

  getUrl: (filename: string) => string | null;
}

export type StorageType = 'local' | 'docker' | 'cloud';

export interface StorageConfig {
  type: StorageType;
  localPath?: string;
  dockerVolume?: string;
  cloudProvider?: 'aws' | 'gcp' | 'azure' | 'cloudflare';
  cloudConfig?: {
    bucket?: string;
    region?: string;
    endpoint?: string;
    credentials?: {
      accessKeyId?: string;
      secretAccessKey?: string;
      token?: string;
      projectId?: string;
    };
  };
  baseUrl?: string;
}
