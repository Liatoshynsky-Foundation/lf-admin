import { useEffect, useState } from 'react';

import { galleryErrors } from '~/constants/errors';

export type GalleryFile = {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  path?: string;
  url?: string;
  directory?: string;
};

export function useGalleryFiles(folder = 'photos') {
  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/uploads?folder=${encodeURIComponent(folder)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const mapped: GalleryFile[] = data.data.map(
            (f: { uploadedAt: string | Date } & Omit<GalleryFile, 'createdAt'>) => ({
              ...f,
              createdAt: f.uploadedAt instanceof Date ? f.uploadedAt.toISOString() : String(f.uploadedAt)
            })
          );
          setFiles(mapped);
        } else {
          setError(galleryErrors.FAILED_TO_FETCH);
        }
      })
      .catch(() => setError(galleryErrors.FAILED_TO_FETCH))
      .finally(() => setIsLoading(false));
  }, [folder]);
  return { files, isLoading, error };
}
