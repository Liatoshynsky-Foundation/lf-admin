'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { MediaModalResult, UploadResult } from '../MediaModal.types';
import { useUpload } from '~/hooks/use-upload/useUpload';
import { AssetType } from '~/types/graphql/generated/graphql';

type Args = {
  open: boolean;
  onClose: () => void;
  onApply: (result: MediaModalResult) => void | Promise<void>;
  directory?: string;
  persistUploadAsAsset?: boolean;
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

const getFileTypeForBackend = (file: File): AssetType => {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (type.startsWith('image/')) return AssetType.Image;
  if (type.startsWith('audio/') || name.endsWith('.mp3') || name.endsWith('.wav')) return AssetType.Audio;
  if (type.includes('spreadsheet') || type.includes('excel') || name.endsWith('.xlsx') || name.endsWith('.xls'))
    return AssetType.Spreadsheet;
  if (type.includes('pdf') || name.endsWith('.pdf')) return AssetType.Pdf;
  if (
    type.includes('zip') ||
    type.includes('rar') ||
    type.includes('compressed') ||
    name.endsWith('.zip') ||
    name.endsWith('.rar')
  )
    return AssetType.Archive;

  return AssetType.Document;
};

const resolveUploadDirectory = (explicitDirectory: string | undefined, backendFileType: string): string => {
  if (explicitDirectory) return explicitDirectory;
  if (backendFileType === 'image') return 'photos';
  if (backendFileType === 'audio') return 'compositions';
  return 'uploads';
};

const createAssetFromUpload = async (uploadResult: UploadResult, type: AssetType): Promise<void> => {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation CreateAsset($input: CreateAssetInput!) {
          createAsset(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          filename: uploadResult.filename,
          originalname: uploadResult.originalName,
          url: uploadResult.url,
          mimeType: uploadResult.mimeType,
          sizeBytes: uploadResult.size,
          type
        }
      }
    })
  });

  const data = await response.json();

  if (!response.ok || data.errors?.length || !data.data?.createAsset) {
    throw new Error('Не вдалося створити запис файлу в базі даних.');
  }
};

export function useMediaModalApply({
  open,
  onClose,
  onApply,
  directory,
  persistUploadAsAsset = false
}: Readonly<Args>): Return {
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

          const finalDirectory = resolveUploadDirectory(directory, backendFileType);

          const uploadResult = await uploadFile(result.selected.file, {
            directory: finalDirectory,
            fileType: backendFileType,
            validationRules: validationRules
          });

          if (!isCurrent()) return;

          if (persistUploadAsAsset) {
            await createAssetFromUpload(uploadResult, backendFileType);
          }

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
    [directory, handleClose, isApplying, onApply, persistUploadAsAsset, uploadFile]
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
