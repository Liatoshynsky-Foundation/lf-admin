import { useEffect, useState } from 'react';

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

export function useGalleryFiles() {
  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/uploads?folder=photos')
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
          setError('Upload files failed');
        }
      })
      .catch(() => setError('Upload files failed'))
      .finally(() => setIsLoading(false));
  }, []);
  return { files, isLoading, error };
}
