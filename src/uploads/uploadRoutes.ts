import { Router } from 'express';
import multer from 'multer';

import { UploadController } from './uploadController';

export interface UploadRoutesConfig {
  controller: UploadController;
  uploadLimits?: {
    fileSize?: number;
    files?: number;
  };
}

const DEFAULT_LIMITS = {
  fileSize: 10 * 1024 * 1024, // 10MB
  files: 10
};

export const createUploadRoutes = (config: UploadRoutesConfig): Router => {
  const { controller, uploadLimits = DEFAULT_LIMITS } = config;

  const router = Router();

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: uploadLimits
  });

  router.post('/single', upload.single('file'), controller.uploadSingleFile);

  router.post('/multiple', upload.array('files'), controller.uploadMultipleFiles);

  router.get('/:filename', controller.getFile);

  router.delete('/:filename', controller.deleteFile);

  router.get('/:filename/metadata', controller.getFileMetadata);

  return router;
};
