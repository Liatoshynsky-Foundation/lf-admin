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
    throw new Error('Document validator not yet implemented');

  case 'video':
    // OPTIONAL: Implement video validator
    // return createVideoValidator(config.rules);
    throw new Error('Video validator not yet implemented');

  case 'audio':
    // OPTIONAL: Implement audio validator
    // return createAudioValidator(config.rules);
    throw new Error('Audio validator not yet implemented');

  case 'generic':
    // OPTIONAL: Implement generic file validator
    // return createGenericValidator(config.rules);
    throw new Error('Generic validator not yet implemented');

  default:
    throw new Error(`Unknown file type: ${config.fileType}`);
  }
};
