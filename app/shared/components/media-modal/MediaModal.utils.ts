import { FILES_UPLOAD_ALLOWED_EXTENSIONS, FILES_UPLOAD_ALLOWED_MIME_TYPES } from '~/constants/files';

const IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;
const AUDIO_EXTENSION = /\.(mp3|wav|ogg|oga|m4a|aac|flac)$/i;
const PDF_EXTENSION = /\.pdf$/i;

const matchesStorageFile = (
  mimeType: string,
  filename: string,
  extension: RegExp,
  matchesMimeType: (value: string) => boolean
): boolean => extension.test(filename) || matchesMimeType(mimeType);

export const matchesImage = (mimeType: string, filename: string): boolean =>
  matchesStorageFile(mimeType, filename, IMAGE_EXTENSION, (value) => value.startsWith('image/'));

export const matchesAudio = (mimeType: string, filename: string): boolean =>
  matchesStorageFile(mimeType, filename, AUDIO_EXTENSION, (value) => value.startsWith('audio/'));

export const matchesPdf = (mimeType: string, filename: string): boolean =>
  matchesStorageFile(mimeType, filename, PDF_EXTENSION, (value) => value.startsWith('uploads/'));

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
