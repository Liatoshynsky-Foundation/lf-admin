import { useCallback, useEffect, useState } from 'react';

import { FileMetadata, FilesResponse } from '~/types/uploads';

interface UseFilesOptions {
  folder?: string;
  autoFetch?: boolean;
}

export const useFiles = (options: UseFilesOptions = {}) => {
  const { folder, autoFetch = true } = options;
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(
    async (folderOverride?: string) => {
      setLoading(true);
      setError(null);
      try {
        const targetFolder = folderOverride ?? folder;
        const queryParams = targetFolder ? `?folder=${encodeURIComponent(targetFolder)}` : '';
        const response = await fetch(`/api/uploads${queryParams}`);
        const data: FilesResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch files');
        }

        setFiles(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [folder]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchFiles();
    }
  }, [fetchFiles, autoFetch]);

  return {
    files,
    loading,
    error,
    refetch: fetchFiles
  };
};
