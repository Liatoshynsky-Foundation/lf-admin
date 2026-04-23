import { useCallback } from 'react';

import {UploadResult} from '~/components/media-modal/MediaModal.types';

interface UploadFileOptions {
    directory?: string;
}

export const useUpload = () => {
  const uploadFile = useCallback(
    async (file: File, options: UploadFileOptions = {}): Promise<UploadResult> => {
      const formData = new FormData();
      formData.append('file', file);

      if (options.directory) {
        formData.append('directory', options.directory);
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
    },
    []
  );

  return { uploadFile };
};
