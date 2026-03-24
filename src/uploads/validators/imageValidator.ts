import {
  combineValidationResults,
  FileValidationRules,
  FileValidator,
  validateExtension,
  validateFileSize,
  validateMimeType,
  ValidationResult
} from './common';

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp'
];

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

export interface ImageValidationRules extends FileValidationRules {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const DEFAULT_IMAGE_RULES: ImageValidationRules = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: IMAGE_MIME_TYPES,
  allowedExtensions: IMAGE_EXTENSIONS,
  maxWidth: 4096,
  maxHeight: 4096
};

const validateImageDimensions = async (_buffer: Buffer, _rules: ImageValidationRules): Promise<ValidationResult> => {
  const errors: string[] = [];

  // Note: This is a basic implementation
  // For production, install and use some library for proper image processing

  return {
    valid: errors.length === 0,
    errors
  };
};

export const createImageValidator = (rules: ImageValidationRules = DEFAULT_IMAGE_RULES): FileValidator => {
  const validate = async (buffer: Buffer, filename: string, mimeType: string): Promise<ValidationResult> => {
    const sizeValidation = validateFileSize(buffer, rules.maxSize);
    const mimeTypeValidation = validateMimeType(mimeType, rules.allowedMimeTypes);
    const extensionValidation = validateExtension(filename, rules.allowedExtensions);

    const dimensionValidation = await validateImageDimensions(buffer, rules);

    return combineValidationResults(sizeValidation, mimeTypeValidation, extensionValidation, dimensionValidation);
  };

  return { validate };
};
