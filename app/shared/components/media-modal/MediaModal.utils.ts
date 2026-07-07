import { FILES_UPLOAD_ALLOWED_EXTENSIONS, FILES_UPLOAD_ALLOWED_MIME_TYPES } from '~/constants/files';

const IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;
const AUDIO_EXTENSION = /\.(mp3|wav|ogg|oga|m4a|aac|flac)$/i;
const PDF_EXTENSION = /\.pdf$/i;

export const matchesImage = (mimeType: string, filename: string): boolean =>
  mimeType ? mimeType.startsWith('image/') : IMAGE_EXTENSION.test(filename);

export const matchesAudio = (mimeType: string, filename: string): boolean =>
  mimeType ? mimeType.startsWith('audio/') : AUDIO_EXTENSION.test(filename);

export const matchesPdf = (mimeType: string, filename: string): boolean =>
  mimeType ? mimeType === 'application/pdf' : PDF_EXTENSION.test(filename);

export const isImageUploadFile = (file: File): boolean => matchesImage(file.type, file.name);

export const isAudioUploadFile = (file: File): boolean => matchesAudio(file.type, file.name);

export const isPdfUploadFile = (file: File): boolean => matchesPdf(file.type, file.name);

export const isAnyAllowedFile = (file: File): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase() as any;

  const isValidExtension = FILES_UPLOAD_ALLOWED_EXTENSIONS.includes(extension);

  if (extension === 'rar') {
    return isValidExtension;
  }

  const isValidMimeType =
    FILES_UPLOAD_ALLOWED_MIME_TYPES.includes(file.type as any) ||
    file.type === '' ||
    file.type === 'application/octet-stream';

  return isValidExtension && isValidMimeType;
};
