import { UPLOAD_ERRORS } from '../errors';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface FileValidationRules {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
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
    errors.push(UPLOAD_ERRORS.FILE_SIZE_EXCEEDED(buffer.length, maxSize));
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateMimeType = (mimeType: string, allowedMimeTypes?: string[]): ValidationResult => {
  const errors: string[] = [];

  if (allowedMimeTypes && !allowedMimeTypes.includes(mimeType)) {
    errors.push(UPLOAD_ERRORS.MIME_TYPE_NOT_ALLOWED(mimeType, allowedMimeTypes));
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
      errors.push(UPLOAD_ERRORS.EXTENSION_NOT_ALLOWED(extension, allowedExtensions));
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
