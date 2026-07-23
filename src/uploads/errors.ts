export const UPLOAD_ERRORS = {
  // Controller errors
  NO_FILE_UPLOADED: 'No file uploaded',
  NO_FILES_UPLOADED: 'No files uploaded',
  FILENAME_REQUIRED: 'Filename is required',
  FILE_NOT_FOUND: 'File not found',
  FILE_NOT_FOUND_OR_DELETE_FAILED: 'File not found or could not be deleted',

  // Service errors
  STORAGE_FAILED: 'Storage failed',
  UNKNOWN_ERROR: 'Unknown error',
  FILE_ALREADY_EXISTS: (filename: string) => `Файл ${filename} вже існує`,

  // Validator errors
  DOCUMENT_VALIDATOR_NOT_IMPLEMENTED: 'Document validator not yet implemented',
  VIDEO_VALIDATOR_NOT_IMPLEMENTED: 'Video validator not yet implemented',
  AUDIO_VALIDATOR_NOT_IMPLEMENTED: 'Audio validator not yet implemented',
  GENERIC_VALIDATOR_NOT_IMPLEMENTED: 'Generic validator not yet implemented',
  UNKNOWN_FILE_TYPE: 'Unknown file type',

  // Storage errors - Cloud (AWS/GCP/Cloudflare)
  S3_CLIENT_NOT_INITIALIZED: 'S3 client not initialized',
  CLOUDFLARE_ENDPOINT_REQUIRED: 'Cloudflare R2 storage requires endpoint configuration',
  UNKNOWN_ERROR_OCCURRED: 'Unknown error occurred',
  FAILED_TO_GET_METADATA: 'Failed to get file metadata',

  // Storage factory errors
  CLOUD_STORAGE_REQUIRES_CONFIG: 'Cloud storage requires cloudProvider and cloudConfig',

  // Validation error templates
  FILE_SIZE_EXCEEDED: (actualSize: number, maxSize: number) =>
    `File size ${actualSize} bytes exceeds maximum allowed size ${maxSize} bytes`,
  MIME_TYPE_NOT_ALLOWED: (mimeType: string, allowedTypes: string[]) =>
    `MIME type ${mimeType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
  EXTENSION_NOT_ALLOWED: (extension: string, allowedExtensions: string[]) =>
    `File extension .${extension} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,

  // Storage error templates
  CLOUD_STORAGE_NOT_IMPLEMENTED: (provider: string) => `Cloud storage for ${provider} not yet implemented`,
  CLOUD_STORAGE_REQUIRES_CREDENTIALS: (provider: string) =>
    `${provider} storage requires accessKeyId and secretAccessKey`,
  UNKNOWN_STORAGE_TYPE: (type: string) => `Unknown storage type: ${type}`
} as const;

export const ensureError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error(UPLOAD_ERRORS.UNKNOWN_ERROR_OCCURRED);
};
