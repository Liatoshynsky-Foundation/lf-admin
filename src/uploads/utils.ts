import * as crypto from 'node:crypto';
import * as path from 'node:path';

import { UPLOAD_ERRORS } from './errors';
import { UploadResult } from '~/uploads/types';

export const getExtensionFromFilename = (filename: string): string => {
  const ext = path.extname(filename);
  return ext ? ext.slice(1).toLowerCase() : '';
};

export const getExtensionFromMimeType = (mimeType: string): string => {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'application/json': 'json',
    'video/mp4': 'mp4',
    'video/mpeg': 'mpeg',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg'
  };

  return mimeToExt[mimeType] ?? '';
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replaceAll(/[^a-zA-Z0-9._-]/g, '_')
    .replaceAll(/_{2,}/g, '_')
    .toLowerCase();
};

export const preserveOriginalFilenameSafely = (originalName: string, _mimeType?: string): string => {
  const filename = originalName.trim().replaceAll(/[\\/]/g, '_');
  const meaningfulName = filename.replaceAll(/[._-]/g, '').trim();

  if (!meaningfulName) {
    throw new Error(UPLOAD_ERRORS.FILENAME_REQUIRED);
  }

  return filename;
};

export const generateUniqueFilename = (originalName: string, mimeType: string): string => {
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(8).toString('hex');
  const extension = getExtensionFromMimeType(mimeType) || getExtensionFromFilename(originalName);
  const dotExtension = extension ? `.${extension}` : '';

  return `${timestamp}-${randomHash}${dotExtension}`;
};

export const generateFilenameWithOriginal = (originalName: string, _mimeType: string): string => {
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(4).toString('hex');
  const nameWithoutExt = path.basename(originalName, path.extname(originalName));
  const sanitized = sanitizeFilename(nameWithoutExt);
  const extension = getExtensionFromFilename(originalName);
  const dotExtension = extension ? `.${extension}` : '';

  return `${timestamp}-${randomHash}-${sanitized}${dotExtension}`;
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = Math.max(0, decimals);
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${value} ${sizes[i]}`;
};

export const convertMulterFile = (file: Express.Multer.File) => ({
  fieldname: file.fieldname,
  originalname: file.originalname,
  encoding: file.encoding,
  mimetype: file.mimetype,
  buffer: file.buffer,
  size: file.size
});

export const parseUploadOptions = (body: Record<string, unknown>): Record<string, unknown> => {
  const options = body.options;
  return typeof options === 'string' ? (JSON.parse(options) as Record<string, unknown>) : {};
};

export const formatUploadResult = (result: UploadResult) => ({
  filename: result.filename,
  originalName: result.originalName,
  url: result.url,
  size: result.size,
  mimeType: result.mimeType,
  metadata: result.metadata
});

export const formatMultipleUploadResults = (results: UploadResult[]) => {
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  return {
    success: failed.length === 0,
    data: {
      uploaded: successful.length,
      failed: failed.length,
      files: successful.map(formatUploadResult),
      errors: failed.map((r) => ({
        originalName: r.originalName,
        errors: r.errors ?? []
      }))
    }
  };
};
