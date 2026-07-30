export interface StorageMetadata {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  path?: string;
  url?: string;
  directory?: string;
  processed?: boolean;
  processingOptions?: Record<string, unknown>;
  [key: string]: unknown;
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
  store: (buffer: Buffer, filename: string, mimeType: string, metadata?: Record<string, unknown>) => Promise<StorageResult>;

  retrieve: (filename: string, folder?: string) => Promise<Buffer | null>;

  delete: (filename: string, folder?: string) => Promise<DeleteResult>;

  move: (sourceFilename: string, targetFilename: string, folder?: string) => Promise<DeleteResult>;

  exists: (filename: string, folder?: string) => Promise<boolean>;

  getMetadata: (filename: string, folder?: string) => Promise<StorageMetadata | null>;

  getUrl: (filename: string) => string | null;

  list: (folder?: string) => Promise<StorageMetadata[]>;
}

export type StorageType = 'cloud';

export interface StorageConfig {
  type: StorageType;
  cloudProvider?: 'aws' | 'gcp' | 'cloudflare';
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
