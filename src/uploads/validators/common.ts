export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface FileValidationRules {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  minWidth?: number; // for images
  minHeight?: number; // for images
  maxWidth?: number; // for images
  maxHeight?: number; // for images
}

export interface FileValidator {
  validate: (buffer: Buffer, filename: string, mimeType: string) => Promise<ValidationResult>;
}

export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

export const validateFileSize = (buffer: Buffer, maxSize?: number): ValidationResult => {
  const errors: string[] = [];

  if (maxSize && buffer.length > maxSize) {
    errors.push(`File size ${buffer.length} bytes exceeds maximum allowed size ${maxSize} bytes`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateMimeType = (mimeType: string, allowedMimeTypes?: string[]): ValidationResult => {
  const errors: string[] = [];

  if (allowedMimeTypes && !allowedMimeTypes.includes(mimeType)) {
    errors.push(`MIME type ${mimeType} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateExtension = (filename: string, allowedExtensions?: string[]): ValidationResult => {
  const errors: string[] = [];

  if (allowedExtensions) {
    const extension = getFileExtension(filename);
    const normalizedAllowed = allowedExtensions.map((ext) => ext.toLowerCase());

    if (!normalizedAllowed.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const combineValidationResults = (...results: ValidationResult[]): ValidationResult => {
  const allErrors = results.flatMap((result) => result.errors);
  return {
    valid: allErrors.length === 0,
    errors: allErrors
  };
};
