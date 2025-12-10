import { UPLOAD_ERRORS } from '../errors';
import { createIdentityProcessor, FileProcessor } from './common';
import { createImageProcessor, ImageProcessingOptions } from './imageProcessor';

export type ProcessorType = 'image' | 'document' | 'video' | 'audio' | 'none';

export interface ProcessorConfig {
  type: ProcessorType;
  options?: Record<string, any>;
}

export const createProcessor = (config: ProcessorConfig): FileProcessor => {
  /* prettier-ignore */
  switch (config.type) {
  case 'image':
    return createImageProcessor(config.options as ImageProcessingOptions);

  case 'document':
    // TODO: Implement document processor (e.g., PDF optimization)
    // return createDocumentProcessor(config.options);
    throw new Error(UPLOAD_ERRORS.DOCUMENT_PROCESSOR_NOT_IMPLEMENTED);

  case 'video':
    // TODO: Implement video processor (e.g., transcoding, thumbnail generation)
    // return createVideoProcessor(config.options);
    throw new Error(UPLOAD_ERRORS.VIDEO_PROCESSOR_NOT_IMPLEMENTED);

  case 'audio':
    // TODO: Implement audio processor (e.g., format conversion, normalization)
    // return createAudioProcessor(config.options);
    throw new Error(UPLOAD_ERRORS.AUDIO_PROCESSOR_NOT_IMPLEMENTED);

  case 'none':
    return createIdentityProcessor();

  default:
    return createIdentityProcessor();
  }
};
