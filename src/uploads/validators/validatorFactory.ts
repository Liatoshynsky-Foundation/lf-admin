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

export type FileType = 'image' | 'document' | 'video' | 'audio' | 'generic' | 'pdf' | 'archive' | 'spreadsheet';

export interface ValidatorConfig {
  fileType: FileType;
  rules?: FileValidationRules;
}

const createBaseValidator = (rules?: FileValidationRules): FileValidator => {
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

const createDocumentValidator = createBaseValidator;
const createArchiveValidator = createBaseValidator;
const createAudioValidator = createBaseValidator;
const createVideoValidator = createBaseValidator;

export const createValidator = (config: ValidatorConfig): FileValidator => {
  const cleanType = config.fileType.trim().toLowerCase();
  switch (cleanType) {
  case 'image':
    return createImageValidator(config.rules as ImageValidationRules);

  case 'document':
  case 'pdf':
  case 'spreadsheet':
    return createDocumentValidator(config.rules);

  case 'archive':
    return createArchiveValidator(config.rules);

  case 'audio':
    return createAudioValidator(config.rules);

  case 'video':
    return createVideoValidator(config.rules);

  default:
    throw new Error(`${UPLOAD_ERRORS.UNKNOWN_FILE_TYPE}: ${config.fileType}`);
  }
};
