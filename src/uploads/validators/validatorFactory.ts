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

const LIMITS = {
  DOCUMENT: 10 * 1024 * 1024,
  ARCHIVE: 50 * 1024 * 1024,
  AUDIO: 12 * 1024 * 1024,
  VIDEO: 100 * 1024 * 1024,
  FILENAME_MAX: 255
};

const createBaseValidator = (rules?: FileValidationRules): FileValidator => {
  return {
    validate: async (buffer: Buffer, filename: string, mimeType: string) => {
      if (buffer.length === 0) {
        return { valid: false, errors: ['Файл не може бути порожнім (0 байт)'] };
      }

      if (filename.length > LIMITS.FILENAME_MAX) {
        return { valid: false, errors: ['Ім\'я файлу занадто довге (максимум 255 символів)'] };
      }

      if (!rules) return { valid: true, errors: [] };
      const sizeValid = validateFileSize(buffer, rules.maxSize);
      const mimeValid = validateMimeType(mimeType, rules.allowedMimeTypes);
      const extValid = validateExtension(filename, rules.allowedExtensions);
      return combineValidationResults(sizeValid, mimeValid, extValid);
    }
  };
};

const createSizeLimitedValidator = (
  rules: FileValidationRules | undefined,
  maxSize: number,
  errorMessage: (mb: number) => string,
  extraValidation?: (
    buffer: Buffer,
    filename: string,
    mimeType: string
  ) => Promise<{ valid: boolean; errors: string[] }>
): FileValidator => {
  const baseValidator = createBaseValidator(rules);
  return {
    validate: async (buffer, filename, mimeType) => {
      const baseResult = await baseValidator.validate(buffer, filename, mimeType);
      if (!baseResult.valid) return baseResult;

      const effectiveMax = rules?.maxSize ? Math.min(rules.maxSize, maxSize) : maxSize;
      if (buffer.length > effectiveMax) {
        return { valid: false, errors: [errorMessage(effectiveMax / (1024 * 1024))] };
      }

      if (extraValidation) {
        return await extraValidation(buffer, filename, mimeType);
      }

      return { valid: true, errors: [] };
    }
  };
};

const createDocumentValidator = (rules?: FileValidationRules) =>
  createSizeLimitedValidator(
    rules,
    LIMITS.DOCUMENT,
    (mb) => `Розмір документа не може перевищувати ${mb}MB`,
    async (buffer, filename, mimeType) => {
      if (mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
        const header = buffer.toString('utf8', 0, 4);
        if (header !== '%PDF') {
          return { valid: false, errors: ['Пошкоджений або підроблений PDF-файл'] };
        }
      }

      return { valid: true, errors: [] };
    }
  );
const createArchiveValidator = (rules?: FileValidationRules) =>
  createSizeLimitedValidator(rules, LIMITS.ARCHIVE, (mb) => `Архів занадто великий (максимум ${mb}MB)`);

const createAudioValidator = (rules?: FileValidationRules) =>
  createSizeLimitedValidator(rules, LIMITS.AUDIO, (mb) => `Аудіофайл завеликий (максимум ${mb}MB)`);

const createVideoValidator = (rules?: FileValidationRules) =>
  createSizeLimitedValidator(rules, LIMITS.VIDEO, (mb) => `Відеофайл перевищує ліміт у ${mb}MB (орієнтовно 5 хвилин)`);

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
