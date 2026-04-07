'use client';

import { Box, Button, Typography } from '@mui/material';
import { Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  FILE_TABS,
  FILES_UPLOAD_ACCEPT,
  FILES_UPLOAD_ALLOWED_EXTENSIONS,
  FILES_UPLOAD_ALLOWED_MIME_TYPES,
  FILES_UPLOAD_ERROR,
  type FilesTabValue
} from '~/constants/files';
import { readFileAsDataURL } from '~/lib/utils/readFileAsDataURL';
import { colors } from '~/shared/components/design-system/button/Button.styles';
import {
  type FileDetailsSidebarFile,
  FileInfoSidebar,
  type FileUsageLink
} from '~/shared/components/file-info-sidebar/FileInfoSidebar';
import { SIDEBAR_WIDTH } from '~/shared/components/file-info-sidebar/FileInfoSidebar.styles';
import {
  FilesCardsLayout,
  type FilesCardsLayoutItem,
  type FilesCardsLayoutView
} from '~/shared/components/files-cards-layout';
import {
  FilteringToolbar,
  SortSelect
} from '~/shared/components/filtering-toolbar';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalRenderers } from '~/shared/components/media-modal/MediaModal.renderers';
import type { MediaModalOpenState, MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';
import { UploadView } from '~/shared/components/media-modal/views/upload-view/UploadView';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { ViewToggle } from '~/shared/components/view-toggle';
import { useAllAssets } from '~/shared/hooks/use-assets/useAssets';
import { useFilesFiltering } from '~/shared/hooks/use-files';
import { AssetType, useUploadBlobMutation } from '~/types/graphql/generated/graphql';

type FilesPageFileItem = FilesCardsLayoutItem & {
  description?: string;
  format?: string;
  createdAtRaw?: string;
  size?: string;
  previewUrl?: string;
  addedBy?: { name: string; avatarUrl?: string };
  usage: FileUsageLink[];
};

type FilesPageContentProps = Readonly<{
  activeTab: FilesTabValue;
}>;

const assetCardTypeMap: Record<AssetType, FilesCardsLayoutItem['type']> = {
  [AssetType.Image]: 'image',
  [AssetType.Pdf]: 'pdf',
  [AssetType.Audio]: 'audio'
};

const supportedUploadMimeTypes = new Set<string>(FILES_UPLOAD_ALLOWED_MIME_TYPES);
const supportedUploadExtensions = new Set<string>(FILES_UPLOAD_ALLOWED_EXTENSIONS);

const isFilesSupportedFile = (file: File): boolean => {
  const mimeType = file.type.toLowerCase();

  if (mimeType) {
    return supportedUploadMimeTypes.has(mimeType);
  }

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

const formatDateAdded = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('uk-UA');
};

const formatFileSize = (sizeBytes: number) => {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  const sizeKb = sizeBytes / 1024;
  if (sizeKb < 1024) {
    return `${sizeKb.toFixed(1)} KB`;
  }

  const sizeMb = sizeKb / 1024;
  return `${sizeMb.toFixed(1)} MB`;
};

const formatFromMimeType = (mimeType: string, filename: string) => {
  const byMime = mimeType.split('/')[1]?.toLowerCase();
  if (byMime === 'jpeg') return 'jpg';
  if (byMime === 'mpeg' && filename.toLowerCase().endsWith('.mp3')) return 'mp3';
  if (byMime) return byMime;

  const ext = filename.split('.').pop()?.toLowerCase();
  return ext || undefined;
};

const usageToLink = (pageId?: string | null) => {
  if (!pageId) {
    return undefined;
  }

  return pageId.startsWith('/') ? pageId : `/${pageId}`;
};

export function FilesPageContent({ activeTab }: FilesPageContentProps) {
  const [view, setView] = useState<FilesCardsLayoutView>('grid');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadModalInitial, setUploadModalInitial] = useState<MediaModalOpenState | undefined>(undefined);
  const { data, loading, error, refetch } = useAllAssets();
  const [uploadBlob] = useUploadBlobMutation();

  const handleOpenUploadFlow = () => {
    setUploadModalInitial({ tab: 'UPLOAD' });
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadFlow = () => {
    setIsUploadModalOpen(false);
    setUploadModalInitial(undefined);
  };

  const handleUploadApply = async (result: MediaModalResult) => {
    if (result.selected.kind !== 'upload') {
      return;
    }

    const file = result.selected.file;
    const dataUrl = await readFileAsDataURL(file);
    const base64 = dataUrl.split(',')[1];

    if (!base64) {
      throw new Error('Не вдалося прочитати файл для завантаження.');
    }

    const uploadResult = await uploadBlob({
      variables: {
        folderName: 'tmp',
        blobName: file.name,
        buffer: base64,
        contentType: file.type || 'application/octet-stream'
      }
    });

    if (!uploadResult.data?.uploadBlob.success) {
      throw new Error('Не вдалося завантажити файл. Спробуйте ще раз.');
    }

    await refetch();
  };

  const allFiles = useMemo<FilesPageFileItem[]>(() => {
    return (data?.allAssets ?? []).map((asset) => ({
      id: asset.id,
      type: assetCardTypeMap[asset.type],
      name: asset.filename,
      dateAdded: formatDateAdded(asset.createdAt),
      createdAtRaw: asset.createdAt,
      isStarred: asset.isStarred,
      usageLinks: asset.usageRefs.length,
      imageSrc: asset.type === AssetType.Image ? asset.url : undefined,
      previewUrl: asset.type === AssetType.Image ? asset.url : undefined,
      format: formatFromMimeType(asset.mimeType, asset.filename),
      size: formatFileSize(asset.sizeBytes),
      addedBy: asset.createdBy ? { name: asset.createdBy } : undefined,
      usage: asset.usageRefs.map((usageRef, index) => ({
        id: `${asset.id}-${index}`,
        label: usageRef.pageId ?? 'Невідомий розділ',
        href: usageToLink(usageRef.pageId)
      })),
      description: asset.description ?? undefined
    }));
  }, [data?.allAssets]);

  const { filteredFiles, toolbarProps, sortProps } = useFilesFiltering(allFiles, activeTab);

  useEffect(() => {
    if (!filteredFiles.length) {
      setSelectedFileId(null);
      setHasInitializedSelection(false);
      return;
    }

    if (!hasInitializedSelection) {
      setSelectedFileId(filteredFiles[0].id);
      setHasInitializedSelection(true);
      return;
    }

    if (selectedFileId && !filteredFiles.some((file) => file.id === selectedFileId)) {
      setSelectedFileId(filteredFiles[0].id);
    }
  }, [filteredFiles, hasInitializedSelection, selectedFileId]);

  const selectedFile = useMemo(
    () => filteredFiles.find((file) => file.id === selectedFileId) ?? null,
    [filteredFiles, selectedFileId]
  );

  const sidebarFile: FileDetailsSidebarFile | null = selectedFile
    ? {
      id: selectedFile.id,
      type: selectedFile.type,
      filename: selectedFile.name,
      previewUrl: selectedFile.previewUrl,
      addedBy: selectedFile.addedBy,
      addedAt: selectedFile.dateAdded,
      format: selectedFile.format,
      size: selectedFile.size,
      usageLinks: selectedFile.usage,
      description: selectedFile.description,
      isStarred: selectedFile.isStarred
    }
    : null;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        pt: '15px',
        pr: { xs: 0, md: sidebarFile ? `${SIDEBAR_WIDTH + 12}px` : 0 },
        transition: 'padding-right 0.2s ease'
      }}
    >
      <PageHeader
        title="Файли"
        activeTab={activeTab}
        tabs={FILE_TABS}
        action={
          <Button
            variant="contained"
            onClick={handleOpenUploadFlow}
            endIcon={<Upload size={20} aria-hidden="true" />}
            sx={{
              borderRadius: '20px',
              px: '24px',
              py: '8px',
              minHeight: '40px',
              textTransform: 'none',
              color: colors.black,
              boxShadow: 'none',
              fontSize: '16px',
              lineHeight: 1.5,
              bgcolor: colors.yellow[500],
              '&:hover': {
                bgcolor: colors.yellow[600],
                boxShadow: 'none'
              }
            }}
          >
            Завантажити файл
          </Button>
        }
      />

      <FilteringToolbar
        {...toolbarProps}
        dataTestId="control-panel"
        rightSlot={<ViewToggle value={view} onChange={setView} />}
        bottomTrailingContent={
          <SortSelect
            {...sortProps}
            minWidth={208}
            dataTestId="files-sort-select"
          />
        }
      />

      <FilesCardsLayout view={view} items={filteredFiles} onItemClick={(item) => setSelectedFileId(item.id)} />

      {loading && <Typography>Завантаження файлів…</Typography>}
      {error && <Typography color="error">Не вдалося завантажити файли.</Typography>}

      {sidebarFile && (
        <FileInfoSidebar
          file={sidebarFile}
          onClose={() => setSelectedFileId(null)}
        />
      )}

      <MediaModal
        open={isUploadModalOpen}
        initial={uploadModalInitial}
        onClose={handleCloseUploadFlow}
        onApply={handleUploadApply}
        renderers={{ upload: renderFilesUpload }}
      />
    </Box>
  );
}