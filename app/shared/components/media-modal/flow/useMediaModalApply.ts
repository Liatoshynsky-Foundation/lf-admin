'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { MediaModalResult } from '../MediaModal.types';
import { useUpload } from '~/hooks/use-upload/useUpload';

type Args = {
  open: boolean;
  onClose: () => void;
  onApply: (result: MediaModalResult) => void | Promise<void>;
  directory?: string;
};

type Return = {
  isApplying: boolean;
  applyError: string | null;
  clearApplyState: () => void;
  clearApplyError: () => void;
  cancelInFlightApply: () => void;
  handleClose: () => void;
  runApply: (result: MediaModalResult) => Promise<void>;
};

const getFileTypeForBackend = (file: File): string => {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('audio/') || name.endsWith('.mp3') || name.endsWith('.wav')) return 'audio';
  if (type.includes('spreadsheet') || type.includes('excel') || name.endsWith('.xlsx') || name.endsWith('.xls'))
    return 'spreadsheet';
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
  if (
    type.includes('zip') ||
    type.includes('rar') ||
    type.includes('compressed') ||
    name.endsWith('.zip') ||
    name.endsWith('.rar')
  )
    return 'archive';

  return 'document';
};

export function useMediaModalApply({ open, onClose, onApply, directory }: Readonly<Args>): Return {
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const { uploadFile } = useUpload();

  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const applySeqRef = useRef(0);

  const clearApplyState = useCallback(() => {
    setIsApplying(false);
    setApplyError(null);
  }, []);

  const clearApplyError = useCallback(() => {
    setApplyError(null);
  }, []);

  const cancelInFlightApply = useCallback(() => {
    applySeqRef.current += 1;
    clearApplyState();
  }, [clearApplyState]);

  const handleClose = useCallback(() => {
    cancelInFlightApply();
    onClose();
  }, [cancelInFlightApply, onClose]);

  const runApply = useCallback(
    async (result: MediaModalResult): Promise<void> => {
      if (isApplying) return;

      const seq = ++applySeqRef.current;
      const isCurrent = () => applySeqRef.current === seq && openRef.current;

      setIsApplying(true);
      setApplyError(null);

      try {
        let enrichedResult = result;

        if (result.selected.kind === 'upload') {
          const backendFileType = getFileTypeForBackend(result.selected.file);

          const fileExt = result.selected.file.name.split('.').pop()?.toLowerCase() || '';
          const fileMime = result.selected.file.type || 'application/octet-stream';

          const validationRules = JSON.stringify({
            allowedMimeTypes: [fileMime],
            allowedExtensions: [fileExt]
          });

          let finalDirectory = directory;

          if (!finalDirectory) {
            if (backendFileType === 'image') {
              finalDirectory = 'photos';
            } else if (backendFileType === 'audio') {
              finalDirectory = 'compositions';
            } else {
              finalDirectory = 'uploads';
            }
          }

          const uploadResult = await uploadFile(result.selected.file, {
            directory: finalDirectory,
            fileType: backendFileType,
            validationRules: validationRules
          });

          if (!isCurrent()) return;

          enrichedResult = { ...result, uploadResult };
        }

        await onApply(enrichedResult);

        if (isCurrent()) {
          handleClose();
        }
      } catch (e: unknown) {
        if (isCurrent()) {
          setApplyError(e instanceof Error ? e.message : 'Не вдалося застосувати зміни. Спробуйте ще раз.');
        }
      } finally {
        if (isCurrent()) {
          setIsApplying(false);
        }
      }
    },
    [directory, handleClose, isApplying, onApply, uploadFile]
  );

  return {
    isApplying,
    applyError,
    clearApplyState,
    clearApplyError,
    cancelInFlightApply,
    handleClose,
    runApply
  };
}
