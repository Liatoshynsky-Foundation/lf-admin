'use client';

import { Box, Button } from '@mui/material';
import { Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import {
  FILE_TABS,
  FILES_EMPTY_STATE_DESCRIPTION,
  FILES_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  FILES_EMPTY_STATE_NO_RESULTS_TITLE,
  FILES_EMPTY_STATE_TITLE,
  FILES_ERROR_STATE_DESCRIPTION,
  FILES_ERROR_STATE_TITLE,
  FILES_FAVORITES_EMPTY_STATE_BUTTON,
  FILES_FAVORITES_EMPTY_STATE_DESCRIPTION,
  FILES_FAVORITES_EMPTY_STATE_TITLE,
  FILES_LOADING_STATE_DESCRIPTION,
  FILES_LOADING_STATE_TITLE,
  FILES_PAGE_TITLE,
  FILES_UNKNOWN_SECTION_LABEL,
  FILES_UPLOAD_ACCEPT,
  FILES_UPLOAD_ALLOWED_EXTENSIONS,
  FILES_UPLOAD_ALLOWED_MIME_TYPES,
  FILES_UPLOAD_BUTTON_LABEL,
  FILES_UPLOAD_ERROR,
  FILES_UPLOAD_FAILED_ERROR,
  type FilesTabValue
} from '~/constants/files';
import FavouriteStarIcon from '~/public/icons/favourite-star.svg';
import { colors } from '~/shared/components/design-system/button/Button.styles';
import { EmptyState } from '~/shared/components/empty-state';
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
import { FilteringToolbar, SortSelect } from '~/shared/components/filtering-toolbar';
import { FileUploadModal } from '~/shared/components/media-modal/FileUploadModal';
import { isAnyAllowedFile } from '~/shared/components/media-modal/MediaModal.utils';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { RenameFileModal } from '~/shared/components/rename-file-modal/RenameFileModal';
import { ViewToggle } from '~/shared/components/view-toggle';
import { useAllAssets } from '~/shared/hooks/use-assets/useAssets';
import { useFilesFiltering } from '~/shared/hooks/use-files';
import { useUpload } from '~/shared/hooks/use-upload/useUpload';
import { AssetType, useCreateAssetMutation } from '~/types/graphql/generated/graphql';

type FilesPageFileItem = FilesCardsLayoutItem & {
  description?: string;
  format?: string;
  createdAtRaw?: string;
  size?: string;
  previewUrl?: string;
  downloadUrl?: string;
  addedBy?: { name: string; avatarUrl?: string };
  usage: FileUsageLink[];
};

type FilesPageContentProps = Readonly<{
  activeTab: FilesTabValue;
}>;

const assetCardTypeMap: Record<AssetType, FilesCardsLayoutItem['type']> = {
  [AssetType.Image]: 'image',
  [AssetType.Pdf]: 'pdf',
  [AssetType.Audio]: 'audio',
  [AssetType.Document]: 'document',
  [AssetType.Spreadsheet]: 'spreadsheet',
  [AssetType.Video]: 'video',
  [AssetType.Archive]: 'archive'
};

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
  const [renameModalState, setRenameModalState] = useState<{ open: boolean; fileId: string; currentFilename: string }>({
    open: false,
    fileId: '',
    currentFilename: ''
  });
  const { data, loading, error, refetch } = useAllAssets();
  const { uploadFile } = useUpload();
  const [createAsset] = useCreateAssetMutation();
  const handleOpenUploadFlow = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadFlow = () => {
    setIsUploadModalOpen(false);
  };

  const handleUploadApply = async (file: File) => {
    let folderName = 'works';
    let assetType = 'document';

    if (file.type.startsWith('image/')) {
      folderName = 'photos';
      assetType = 'image';
    } else if (file.type.startsWith('audio/')) {
      folderName = 'compositions';
      assetType = 'audio';
    } else if (file.type.includes('pdf')) {
      assetType = 'pdf';
    } else if (
      file.type.includes('zip') ||
      file.type.includes('rar') ||
      file.type.includes('compressed') ||
      file.name.toLowerCase().endsWith('.rar')
    ) {
      assetType = 'archive';
    } else if (file.type.includes('spreadsheet') || file.type.includes('excel')) {
      assetType = 'spreadsheet';
    }

    try {
      const uploadResult = await uploadFile(file, {
        directory: folderName,
        fileType: assetType,
        validationRules: JSON.stringify({
          allowedMimeTypes: Array.from(FILES_UPLOAD_ALLOWED_MIME_TYPES),
          allowedExtensions: Array.from(FILES_UPLOAD_ALLOWED_EXTENSIONS)
        })
      });

      await createAsset({
        variables: {
          input: {
            filename: uploadResult.originalName || file.name,
            mimeType: uploadResult.mimeType || file.type,
            sizeBytes: uploadResult.size || file.size,
            url: uploadResult.url,
            type: assetType
          }
        }
      });

      await refetch();
      toast.success('Файл успішно завантажено!');
    } catch {
      toast.error('Помилка завантаження файлу');
      throw new Error(FILES_UPLOAD_FAILED_ERROR);
    }
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
        label: usageRef.pageId ?? FILES_UNKNOWN_SECTION_LABEL,
        href: usageToLink(usageRef.pageId)
      })),
      description: asset.description ?? undefined
    }));
  }, [data?.allAssets]);

  const { filteredFiles, toolbarProps, sortProps } = useFilesFiltering(allFiles, activeTab);

  const hasActiveCriteria = Boolean(toolbarProps.search?.search.trim()) || Boolean(toolbarProps.activeFiltersCount);
  const isFavoritesTab = activeTab === 'favorites';
  const hasNoFiles = !loading && !error && filteredFiles.length === 0;

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
        pr: { xs: 0, md: sidebarFile ? `${SIDEBAR_WIDTH}px` : 0 },
        transition: 'padding-right 0.2s ease'
      }}
    >
      <PageHeader
        title={FILES_PAGE_TITLE}
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
            {FILES_UPLOAD_BUTTON_LABEL}
          </Button>
        }
      />

      <FilteringToolbar
        {...toolbarProps}
        dataTestId="control-panel"
        rightSlot={<ViewToggle value={view} onChange={setView} />}
        bottomTrailingContent={<SortSelect {...sortProps} minWidth={208} dataTestId="files-sort-select" />}
      />

      {loading && <EmptyState title={FILES_LOADING_STATE_TITLE} description={FILES_LOADING_STATE_DESCRIPTION} />}

      {!loading && error && <EmptyState title={FILES_ERROR_STATE_TITLE} description={FILES_ERROR_STATE_DESCRIPTION} />}

      {!loading && !error && filteredFiles.length > 0 && (
        <FilesCardsLayout view={view} items={filteredFiles} onItemClick={(item) => setSelectedFileId(item.id)} />
      )}

      {hasNoFiles && isFavoritesTab && !hasActiveCriteria && (
        <EmptyState
          title={FILES_FAVORITES_EMPTY_STATE_TITLE}
          description={FILES_FAVORITES_EMPTY_STATE_DESCRIPTION}
          icon={<FavouriteStarIcon />}
          action={{ label: FILES_FAVORITES_EMPTY_STATE_BUTTON, href: '/files' }}
        />
      )}

      {hasNoFiles && hasActiveCriteria && (
        <EmptyState title={FILES_EMPTY_STATE_NO_RESULTS_TITLE} description={FILES_EMPTY_STATE_NO_RESULTS_DESCRIPTION} />
      )}

      {hasNoFiles && !isFavoritesTab && !hasActiveCriteria && (
        <EmptyState title={FILES_EMPTY_STATE_TITLE} description={FILES_EMPTY_STATE_DESCRIPTION} />
      )}

      {sidebarFile && (
        <FileInfoSidebar
          file={sidebarFile}
          onClose={() => setSelectedFileId(null)}
          onRequestAction={(action) => {
            if (action.type === 'rename') {
              setRenameModalState({
                open: true,
                fileId: action.fileId,
                currentFilename: sidebarFile.filename
              });
            }
          }}
        />
      )}
      <FileUploadModal
        open={isUploadModalOpen}
        onClose={handleCloseUploadFlow}
        onApply={handleUploadApply}
        accept={FILES_UPLOAD_ACCEPT}
        invalidFileError={FILES_UPLOAD_ERROR}
        isAllowedFile={isAnyAllowedFile}
      />
      <RenameFileModal
        open={renameModalState.open}
        fileId={renameModalState.fileId}
        currentFilename={renameModalState.currentFilename}
        onClose={() => setRenameModalState((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
}
