export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface UploadResult {
  success: boolean;
  filename?: string;
  originalName?: string;
  url?: string;
  size?: number;
  mimeType?: string;
  metadata?: Record<string, any>;
  errors?: string[];
}

export interface UploadOptions {
  fileType?: 'image' | 'document' | 'video' | 'audio' | 'generic';
  validationRules?: Record<string, any>;
  processingOptions?: Record<string, any>;
  generateFilename?: (originalName: string, mimeType: string) => string;
  metadata?: Record<string, any>;
}
