import { useCallback,useState } from 'react';

interface UploadResponse {
    success: boolean;
    data?: {
        success: boolean;
        url: string;
        filename: string;
    };
    error?: string;
    errors?: string[];
}

export function useUploadFile() {
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(async (file: File, directory = 'media'): Promise<UploadResponse> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', directory);

      const response = await fetch('/api/uploads/single', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResponse = await response.json();
      return result;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown upload error'
      };
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, isUploading };
}