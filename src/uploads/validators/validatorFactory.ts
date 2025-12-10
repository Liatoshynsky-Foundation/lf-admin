import { UPLOAD_ERRORS } from '../errors';
import { FileValidationRules, FileValidator } from './common';
import { createImageValidator, ImageValidationRules } from './imageValidator';

export type FileType = 'image' | 'document' | 'video' | 'audio' | 'generic';

export interface ValidatorConfig {
  fileType: FileType;
  rules?: FileValidationRules;
}

/* prettier-ignore */
export const createValidator = (config: ValidatorConfig): FileValidator => {
  switch (config.fileType) {
  case 'image':
    return createImageValidator(config.rules as ImageValidationRules);

  case 'document':
    // OPTIONAL: Implement document validator
    // return createDocumentValidator(config.rules);
    throw new Error(UPLOAD_ERRORS.DOCUMENT_VALIDATOR_NOT_IMPLEMENTED);

  case 'video':
    // OPTIONAL: Implement video validator
    // return createVideoValidator(config.rules);
    throw new Error(UPLOAD_ERRORS.VIDEO_VALIDATOR_NOT_IMPLEMENTED);

  case 'audio':
    // OPTIONAL: Implement audio validator
    // return createAudioValidator(config.rules);
    throw new Error(UPLOAD_ERRORS.AUDIO_VALIDATOR_NOT_IMPLEMENTED);

  case 'generic':
    // OPTIONAL: Implement generic file validator
    // return createGenericValidator(config.rules);
    throw new Error(UPLOAD_ERRORS.GENERIC_VALIDATOR_NOT_IMPLEMENTED);

  default:
    throw new Error(`${UPLOAD_ERRORS.UNKNOWN_FILE_TYPE}: ${config.fileType}`);
  }
};
