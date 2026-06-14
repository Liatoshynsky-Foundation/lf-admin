'use client';

import { Dayjs } from 'dayjs';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { CompositionModalView } from './composition-modal-view/CompositionModalView';
import { AudioEntry, NoteEntry } from '~/constants/creativity';
import {
  FILES_UPLOAD_ACCEPT,
  FILES_UPLOAD_ALLOWED_EXTENSIONS,
  FILES_UPLOAD_ALLOWED_MIME_TYPES,
  FILES_UPLOAD_ERROR,
  FILES_UPLOAD_FAILED_ERROR} from '~/constants/files';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalRenderers } from '~/shared/components/media-modal/MediaModal.renderers';
import type {
  MediaModalOpenState,
  MediaModalResult,
  UploadResult
} from '~/shared/components/media-modal/MediaModal.types';
import { UploadView } from '~/shared/components/media-modal/views/upload-view/UploadView';
import { useAllAssets } from '~/shared/hooks/use-assets/useAssets';
import { AssetType, useCreateAssetMutation } from '~/types/graphql/generated/graphql';

const supportedUploadMimeTypes = new Set<string>(FILES_UPLOAD_ALLOWED_MIME_TYPES);
const supportedUploadExtensions = new Set<string>(FILES_UPLOAD_ALLOWED_EXTENSIONS);

const isFilesSupportedFile = (file: File): boolean => {
  const mimeType = file.type.toLowerCase();
  if (mimeType) return supportedUploadMimeTypes.has(mimeType);
  const extension = file.name.split('.').pop()?.toLowerCase();
  return Boolean(extension && supportedUploadExtensions.has(extension));
};

const renderFilesUpload: MediaModalRenderers['upload'] = (props) => (
  <UploadView
    {...props}
    accept={FILES_UPLOAD_ACCEPT}
    invalidFileError={FILES_UPLOAD_ERROR}
    isAllowedFile={isFilesSupportedFile}
    ariaLabel="Upload file"
  />
);

interface CompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CompositionModal: React.FC<CompositionModalProps> = ({ isOpen, onClose }) => {
  const { data, loading, refetch } = useAllAssets();
  const [createAsset] = useCreateAssetMutation();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadModalInitial, setUploadModalInitial] = useState<MediaModalOpenState | undefined>(undefined);

  const [uploadTarget, setUploadTarget] = useState<{
    mode: 'audio' | 'notes';
    onSuccess: (fileName: string) => void;
      } | null>(null);

  const suggestions = useMemo(() => {
    const audioFiles = new Set<string>();
    const noteFiles = new Set<string>();

    data?.allAssets?.forEach((asset) => {
      if (asset.type === AssetType.Audio) {
        audioFiles.add(asset.filename);
      } else if (asset.type === AssetType.Pdf) {
        noteFiles.add(asset.filename);
      }
    });

    return {
      audio: Array.from(audioFiles),
      notes: Array.from(noteFiles)
    };
  }, [data?.allAssets]);

  const handleTriggerUpload = (mode: 'audio' | 'notes', onSuccess: (fileName: string) => void) => {
    setUploadTarget({ mode, onSuccess });
    setUploadModalInitial({ tab: 'UPLOAD' });
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadFlow = () => {
    setIsUploadModalOpen(false);
    setUploadModalInitial(undefined);
    setUploadTarget(null);
  };

  const handleUploadApply = async (result: MediaModalResult & { uploadResult?: UploadResult }) => {
    if (result.selected.kind !== 'upload' || !result.uploadResult) return;

    const file = result.selected.file;
    const { url, filename, originalName, mimeType, size } = result.uploadResult;

    const type = file.type.toLowerCase();
    let assetType = '';
    if (type.startsWith('audio/')) assetType = 'audio';
    else if (type.endsWith('/pdf')) assetType = 'pdf';

    try {
      const finalFilename = originalName || filename;

      const createResult = await createAsset({
        variables: {
          input: {
            filename: finalFilename,
            url: url,
            mimeType: mimeType,
            sizeBytes: size,
            type: assetType
          }
        }
      });

      if (!createResult.data?.createAsset) {
        throw new Error(FILES_UPLOAD_FAILED_ERROR);
      }

      await refetch();

      if (uploadTarget) {
        uploadTarget.onSuccess(finalFilename);
      }

      toast.success('Файл успішно завантажено');
      handleCloseUploadFlow();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити файл.');
    }
  };

  const handleSaveComposition = async (
    title: string,
    genre: string,
    year: Dayjs | null,
    audio: AudioEntry[],
    notes: NoteEntry[]
  ) => {
    try {
      // TODO: Replace with actual createComposition mutation
      // eslint-disable-next-line no-console
      console.log('Saving composition:', { title, genre, year: year?.year(), audio, notes });

      toast.success('Композиція успішно створена!');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Помилка при створенні композиції: ${errorMessage}`);
    }
  };

  return (
    <>
      <CompositionModalView
        isOpen={isOpen}
        isLoadingData={loading}
        suggestions={suggestions}
        onClose={onClose}
        onSave={handleSaveComposition}
        onTriggerUpload={handleTriggerUpload}
      />

      <MediaModal
        open={isUploadModalOpen}
        initial={uploadModalInitial}
        onClose={handleCloseUploadFlow}
        onApply={handleUploadApply}
        renderers={{ upload: renderFilesUpload }}
        hideTabs={true}
      />
    </>
  );
};

export default CompositionModal;
