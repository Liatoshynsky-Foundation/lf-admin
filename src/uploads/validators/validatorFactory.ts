import {
  combineValidationResults,
  FileValidationRules,
  FileValidator,
  validateExtension,
  validateFileSize,
  validateMimeType
} from './common';
import { createImageValidator, ImageValidationRules } from './imageValidator';

export type FileType =
  | 'image'
  | 'document'
  | 'video'
  | 'audio'
  | 'generic'
  | 'pdf'
  | 'archive'
  | 'docx'
  | 'zip'
  | 'xlsx'
  | 'rar';

export interface ValidatorConfig {
  fileType: FileType;
  rules?: FileValidationRules;
}

const createGenericValidator = (rules?: FileValidationRules): FileValidator => {
  return {
    validate: async (buffer: Buffer, filename: string, mimeType: string) => {
      if (!rules) return { valid: true, errors: [] };

      const sizeValid = validateFileSize(buffer, rules.maxSize);
      const mimeValid = validateMimeType(mimeType, rules.allowedMimeTypes);
      const extValid = validateExtension(filename, rules.allowedExtensions);

      return combineValidationResults(sizeValid, mimeValid, extValid);
    }
  };
};

export const createValidator = (config: ValidatorConfig): FileValidator => {
  switch (config.fileType) {
  case 'image':
    return createImageValidator(config.rules as ImageValidationRules);

  case 'document':
  case 'pdf':
  case 'docx':
  case 'xlsx':
  case 'audio':
  case 'video':
  case 'zip':
  case 'rar':
  case 'archive':
  case 'generic':
    return createGenericValidator(config.rules);

  default:
    return createGenericValidator(config.rules);
  }
};
