import { useCallback } from 'react';

import { UploadResult } from '~/components/media-modal/MediaModal.types';

interface UploadFileOptions {
  directory?: string;
  validationRules?: string;
  fileType?: string;
}

export const useUpload = () => {
  const uploadFile = useCallback(async (file: File, config: UploadFileOptions = {}): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    if (config.directory) {
      formData.append('directory', config.directory);
    }

    if (config.fileType) {
      formData.append('fileType', config.fileType);
    }

    if (config.validationRules) {
      formData.append('validationRules', config.validationRules);
    }

    const response = await fetch('/api/uploads/single', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!data.success) {
      const message = data.errors?.join(', ') ?? data.error ?? 'Upload failed';
      throw new Error(message);
    }

    return {
      url: data.data.url,
      filename: data.data.filename,
      originalName: data.data.originalName,
      mimeType: data.data.mimeType,
      size: data.data.size
    };
  }, []);

  return { uploadFile };
};
