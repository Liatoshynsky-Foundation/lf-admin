import { FILES_UPLOAD_ALLOWED_EXTENSIONS, FILES_UPLOAD_ALLOWED_MIME_TYPES } from '~/constants/files';

export const isImageUploadFile = (file: File): boolean => {
  if (file.type) return file.type.startsWith('image/');
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name);
};

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
