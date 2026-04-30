import { UPLOAD_ERRORS } from '../errors';
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

const createDocumentValidator = (rules?: FileValidationRules): FileValidator => {
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

const createArchiveValidator = (rules?: FileValidationRules): FileValidator => {
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

const createAudioValidator = (rules?: FileValidationRules): FileValidator => {
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

const createVideoValidator = (rules?: FileValidationRules): FileValidator => {
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
    return createDocumentValidator(config.rules);

  case 'archive':
  case 'zip':
  case 'rar':
    return createArchiveValidator(config.rules);

  case 'audio':
    return createAudioValidator(config.rules);

  case 'video':
    return createVideoValidator(config.rules);

  default:
    throw new Error(`${UPLOAD_ERRORS.UNKNOWN_FILE_TYPE}: ${config.fileType}`);
  }
};
