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

  // Validator errors
  DOCUMENT_VALIDATOR_NOT_IMPLEMENTED: 'Document validator not yet implemented',
  VIDEO_VALIDATOR_NOT_IMPLEMENTED: 'Video validator not yet implemented',
  AUDIO_VALIDATOR_NOT_IMPLEMENTED: 'Audio validator not yet implemented',
  GENERIC_VALIDATOR_NOT_IMPLEMENTED: 'Generic validator not yet implemented',
  UNKNOWN_FILE_TYPE: 'Unknown file type',

  // Processor errors
  DOCUMENT_PROCESSOR_NOT_IMPLEMENTED: 'Document processor not yet implemented',
  VIDEO_PROCESSOR_NOT_IMPLEMENTED: 'Video processor not yet implemented',
  AUDIO_PROCESSOR_NOT_IMPLEMENTED: 'Audio processor not yet implemented',

  // Storage errors - Azure
  AZURE_URL_NOT_DEFINED: 'Azure SAS URL is not defined',
  FAILED_TO_UPLOAD_BLOB: 'Failed to upload blob to Azure',
  FAILED_TO_DELETE_BLOB: 'Failed to delete blob from Azure',
  BLOB_DOES_NOT_EXIST: 'Blob does not exist',

  // Storage errors - Cloud (AWS/GCP/Cloudflare)
  S3_CLIENT_NOT_INITIALIZED: 'S3 client not initialized',
  CLOUDFLARE_ENDPOINT_REQUIRED: 'Cloudflare R2 storage requires endpoint configuration',
  UNKNOWN_ERROR_OCCURRED: 'Unknown error occurred',

  // Storage errors - Local/Docker
  FILE_NOT_FOUND_OR_COULD_NOT_BE_DELETED: 'File not found or could not be deleted',
  METADATA_NOT_FOUND_OR_COULD_NOT_BE_DELETED: 'Metadata not found or could not be deleted',

  // Storage factory errors
  LOCAL_STORAGE_REQUIRES_PATH: 'Local storage requires localPath in config',
  DOCKER_STORAGE_REQUIRES_VOLUME: 'Docker storage requires dockerVolume in config',
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
