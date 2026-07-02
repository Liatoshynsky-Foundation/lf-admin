'use client';

import { ApolloCache, FetchResult, NormalizedCacheObject, Reference } from '@apollo/client';
import { SxProps } from '@mui/material';
import { Theme } from '@mui/system';
import { Dayjs } from 'dayjs';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { CompositionModalView } from './composition-modal-view/CompositionModalView';
import {
  AudioEntry,
  NoteEntry,
  SHEET_MUSIC_FILE_SIZE_ERROR,
  SHEET_MUSIC_MAX_FILE_SIZE_BYTES
} from '~/constants/creativity';
import { FILES_UPLOAD_FAILED_ERROR } from '~/constants/files';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalRenderers, UploadRendererProps } from '~/shared/components/media-modal/MediaModal.renderers';
import type {
  MediaModalOpenState,
  MediaModalResult,
  UploadResult
} from '~/shared/components/media-modal/MediaModal.types';
import { UploadView } from '~/shared/components/media-modal/views/upload-view/UploadView';
import { useAllAssets } from '~/shared/hooks/use-assets/useAssets';
import { AssetType, CreateAssetMutation, useCreateAssetMutation } from '~/types/graphql/generated/graphql';

type DynamicUploadViewProps = UploadRendererProps & { isAudioMode: boolean };

const DynamicUploadView: React.FC<DynamicUploadViewProps> = ({ isAudioMode, ...props }) => {
  const dynamicAccept = isAudioMode ? 'audio/*' : 'application/pdf,.pdf';
  const dynamicInvalidError = isAudioMode ? 'Очікується аудіо файл' : 'Очікується PDF файл';

  const dynamicIsAllowedFile = (file: File): boolean => {
    const mimeType = file.type.toLowerCase();
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (isAudioMode) {
      return mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(extension || '');
    }
    return mimeType === 'application/pdf' || extension === 'pdf';
  };

  return (
    <UploadView
      {...props}
      accept={dynamicAccept}
      invalidFileError={dynamicInvalidError}
      isAllowedFile={dynamicIsAllowedFile}
      ariaLabel={isAudioMode ? 'Завантажити аудіо' : 'Завантажити ноти'}
      maxSizeBytes={isAudioMode ? undefined : SHEET_MUSIC_MAX_FILE_SIZE_BYTES}
      fileTooLargeError={isAudioMode ? undefined : SHEET_MUSIC_FILE_SIZE_ERROR}
    />
  );
};

interface CompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  sx?: SxProps<Theme>;
}

const CompositionModal: React.FC<CompositionModalProps> = ({ isOpen, onClose, mode = 'create', sx }) => {
  const { data, loading } = useAllAssets();
  const [createAsset] = useCreateAssetMutation();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadModalInitial, setUploadModalInitial] = useState<MediaModalOpenState | undefined>(undefined);

  const [uploadTarget, setUploadTarget] = useState<{
    mode: 'audio' | 'notes';
    onSuccess: (fileName: string) => void;
      } | null>(null);

  const isAudioMode = uploadTarget?.mode === 'audio';

  const renderUpload = React.useCallback(
    (props: UploadRendererProps) => <DynamicUploadView {...props} isAudioMode={isAudioMode} />,
    [isAudioMode]
  );

  const dynamicRenderers = useMemo<Partial<MediaModalRenderers>>(
    () => ({
      upload: renderUpload
    }),
    [renderUpload]
  );

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

  const updateAllAssetsCache = (
    cache: ApolloCache<NormalizedCacheObject>,
    { data }: FetchResult<CreateAssetMutation>
  ) => {
    const newAsset = data?.createAsset;
    if (!newAsset) return;

    cache.modify<{ allAssets: Reference[] }>({
      fields: {
        allAssets(existingAssetRefs = []) {
          const newAssetId = cache.identify(newAsset);
          if (!newAssetId) return existingAssetRefs;

          const newAssetRef: Reference = { __ref: newAssetId };

          const isDuplicate = existingAssetRefs.some((ref) => ref.__ref === newAssetRef.__ref);

          if (isDuplicate) return existingAssetRefs;

          return [...existingAssetRefs, newAssetRef];
        }
      }
    });
  };

  const handleUploadApply = async (result: MediaModalResult & { uploadResult?: UploadResult }) => {
    if (result.selected.kind !== 'upload' || !result.uploadResult) return;

    const file = result.selected.file;
    const { url, filename, originalName, mimeType, size } = result.uploadResult;

    const type = file.type.toLowerCase();
    let assetType = '';
    if (type.startsWith('audio/')) assetType = 'audio';
    else if (type.endsWith('/pdf') || type === 'application/pdf') assetType = 'pdf';

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
        },
        update: updateAllAssetsCache
      });

      if (!createResult.data?.createAsset) {
        throw new Error(FILES_UPLOAD_FAILED_ERROR);
      }

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
        dialogTitle={mode === 'create' ? 'Нова композиція' : 'Редагування композиції'}
        isOpen={isOpen}
        isLoadingData={loading}
        suggestions={suggestions}
        onClose={onClose}
        onSave={handleSaveComposition}
        onTriggerUpload={handleTriggerUpload}
        sx={sx}
      />

      <MediaModal
        open={isUploadModalOpen}
        initial={uploadModalInitial}
        onClose={handleCloseUploadFlow}
        onApply={handleUploadApply}
        renderers={dynamicRenderers} // <-- Now using the dynamic renderers!
        hideTabs={true}
      />
    </>
  );
};

export default CompositionModal;
