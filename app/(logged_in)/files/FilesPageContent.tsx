'use client';

import { Box, Button } from '@mui/material';
import { Upload } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { getFilePageContentWrapper, styles } from './FilesPageContent.styles';
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
import { downloadFile } from '~/lib/utils/downloadFile';
import FavouriteStarIcon from '~/public/icons/favourite-star.svg';
import DeleteFileModal from '~/shared/components/delete-file-modal/DeleteFileModal';
import { EmptyState } from '~/shared/components/empty-state';
import {
  type FileDetailsSidebarFile,
  FileInfoSidebar,
  type FileUsageLink
} from '~/shared/components/file-info-sidebar/FileInfoSidebar';
import {
  FilesCardsLayout,
  type FilesCardsLayoutItem,
  type FilesCardsLayoutView
} from '~/shared/components/files-cards-layout';
import { FilteringToolbar, SortSelect } from '~/shared/components/filtering-toolbar';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalRenderers } from '~/shared/components/media-modal/MediaModal.renderers';
import type {
  MediaModalOpenState,
  MediaModalResult,
  UploadResult
} from '~/shared/components/media-modal/MediaModal.types';
import { UploadView } from '~/shared/components/media-modal/views/upload-view/UploadView';
import { PageHeader } from '~/shared/components/page-header/PageHeader';
import { RenameFileModal } from '~/shared/components/rename-file-modal/RenameFileModal';
import { ViewToggle } from '~/shared/components/view-toggle';
import { useAllAssets } from '~/shared/hooks/use-assets/useAssets';
import { useFilesFiltering } from '~/shared/hooks/use-files';
import { AssetType, useCreateAssetMutation, useDeleteAssetMutation } from '~/types/graphql/generated/graphql';

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
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext) {
    if (ext === 'jpeg') return 'jpg';
    return ext;
  }

  const byMime = mimeType.split('/')[1]?.toLowerCase();
  if (!byMime) return undefined;

  if (byMime.includes('spreadsheetml')) return 'xlsx';
  if (byMime.includes('wordprocessingml')) return 'docx';
  if (byMime.includes('zip')) return 'zip';
  if (byMime.includes('rar')) return 'rar';
  if (byMime.includes('svg')) return 'svg';
  if (byMime === 'jpeg') return 'jpg';
  if (byMime === 'wave' || byMime === 'x-wav') return 'wav';

  return byMime;
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
  const fileCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{ open: boolean; fileId: string | null }>({
    open: false,
    fileId: null
  });
  const [uploadModalInitial, setUploadModalInitial] = useState<MediaModalOpenState | undefined>(undefined);
  const [renameModalState, setRenameModalState] = useState<{ open: boolean; fileId: string; currentFilename: string }>({
    open: false,
    fileId: '',
    currentFilename: ''
  });
  const { data, loading, error, refetch } = useAllAssets();
  const [createAsset] = useCreateAssetMutation();
  const [deleteAsset, { loading: isDeleting }] = useDeleteAssetMutation();

  const handleItemRef = useCallback((itemId: string, node: HTMLDivElement | null) => {
    fileCardRefs.current[itemId] = node;
  }, []);

  const handleItemClick = (item: FilesCardsLayoutItem) => {
    setSelectedFileId(item.id);
  };

  const handleOpenUploadFlow = () => {
    setUploadModalInitial({ tab: 'UPLOAD' });
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadFlow = () => {
    setIsUploadModalOpen(false);
    setUploadModalInitial(undefined);
  };

  const handleUploadApply = async (result: MediaModalResult & { uploadResult?: UploadResult }) => {
    if (result.selected.kind !== 'upload' || !result.uploadResult) {
      return;
    }

    const file = result.selected.file;
    const { url, filename, originalName, mimeType, size } = result.uploadResult;

    let assetType = 'document';
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    if (type.includes('spreadsheet') || name.endsWith('.xlsx') || name.endsWith('.xls')) assetType = 'spreadsheet';
    else if (type.includes('pdf') || name.endsWith('.pdf')) assetType = 'pdf';
    else if (type.includes('zip') || type.includes('rar') || name.endsWith('.rar')) assetType = 'archive';
    else if (type.startsWith('audio/')) assetType = 'audio';
    else if (type.startsWith('image/')) assetType = 'image';

    const createResult = await createAsset({
      variables: {
        input: {
          filename: filename,
          originalname: originalName,
          url: url,
          mimeType: mimeType,
          sizeBytes: size,
          type: assetType
        }
      },
      refetchQueries: ['AllAssets']
    });

    if (!createResult.data?.createAsset) {
      throw new Error(FILES_UPLOAD_FAILED_ERROR);
    }

    await refetch();
  };

  const allFiles = useMemo<FilesPageFileItem[]>(() => {
    return (data?.allAssets ?? []).map((asset) => ({
      id: asset.id,
      type: assetCardTypeMap[asset.type],
      name: asset.originalname || asset.filename,
      dateAdded: formatDateAdded(asset.createdAt),
      createdAtRaw: asset.createdAt,
      isStarred: asset.isStarred,
      usageLinks: asset.usageRefs.length,
      downloadUrl: asset.url,
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

  const handleDownload = async (fileUrl: string, filename: string) => {
    await downloadFile(fileUrl, filename);
  };

  const handleItemAction = (action: 'rename' | 'delete' | 'download', item: FilesCardsLayoutItem) => {
    if (action === 'rename') {
      setRenameModalState({ open: true, fileId: item.id, currentFilename: item.name });
    } else if (action === 'delete') {
      setDeleteModalState({ open: true, fileId: item.id });
    } else if (action === 'download') {
      const file = allFiles.find((f) => f.id === item.id);
      if (file?.downloadUrl) {
        handleDownload(file.downloadUrl, file.name);
      } else {
        toast.error('Посилання на завантаження відсутнє');
      }
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteAsset({
        variables: { id },
        update: (cache) => {
          cache.evict({ id: cache.identify({ __typename: 'Asset', id }) });
          cache.gc();
        }
      });
      toast.success('Файл успішно видалено');
      setDeleteModalState({ open: false, fileId: null });
      if (selectedFileId === id) setSelectedFileId(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Не вдалося видалити файл. Спробуйте пізніше.';
      toast.error(message);
    }
  };

  const fileForDeleteModal = useMemo(() => {
    if (!deleteModalState.fileId) return null;
    const file = allFiles.find((f) => f.id === deleteModalState.fileId);
    if (!file) return null;
    return {
      id: file.id,
      filename: file.name,
      usageRefs: file.usage.map((u) => ({ pageId: u.label, blockId: '' }))
    };
  }, [deleteModalState.fileId, allFiles]);

  const { filteredFiles, toolbarProps, sortProps } = useFilesFiltering(allFiles, activeTab);

  const hasActiveCriteria = Boolean(toolbarProps.search?.search.trim()) || Boolean(toolbarProps.activeFiltersCount);
  const isFavoritesTab = activeTab === 'favorites';
  const hasNoFiles = !loading && !error && filteredFiles.length === 0;

  useEffect(() => {
    if (!filteredFiles.length) {
      setSelectedFileId(null);
      return;
    }

    if (selectedFileId && !filteredFiles.some((file) => file.id === selectedFileId)) {
      setSelectedFileId(null);
    }
  }, [filteredFiles, selectedFileId]);

  useEffect(() => {
    if (!selectedFileId) {
      return;
    }

    fileCardRefs.current[selectedFileId]?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth'
    });
  }, [selectedFileId]);

  useEffect(() => {
    if (!selectedFileId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedFileId(null);
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);

    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedFileId]);

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
      isStarred: selectedFile.isStarred,
      downloadUrl: selectedFile.downloadUrl
    }
    : null;

  return (
    <Box sx={getFilePageContentWrapper(Boolean(sidebarFile))}>
      <PageHeader
        title={FILES_PAGE_TITLE}
        activeTab={activeTab}
        tabs={FILE_TABS}
        action={
          <Button
            variant="contained"
            onClick={handleOpenUploadFlow}
            endIcon={<Upload size={20} aria-hidden="true" />}
            sx={styles.pageHeaderButton}
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

      <Box sx={styles.contentLayout}>
        <Box sx={styles.filesArea}>
          {loading && <EmptyState title={FILES_LOADING_STATE_TITLE} description={FILES_LOADING_STATE_DESCRIPTION} />}

          {!loading && error && <EmptyState title={FILES_ERROR_STATE_TITLE} description={FILES_ERROR_STATE_DESCRIPTION} />}

          {!loading && !error && filteredFiles.length > 0 && (
            <FilesCardsLayout
              view={view}
              items={filteredFiles}
              selectedItemId={selectedFileId}
              gridColumns={sidebarFile ? { xlCols: 3 } : undefined}
              setItemRef={handleItemRef}
              onItemClick={handleItemClick}
              onItemAction={handleItemAction}
            />
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
        </Box>

      </Box>
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
      <MediaModal
        open={isUploadModalOpen}
        initial={uploadModalInitial}
        onClose={handleCloseUploadFlow}
        onApply={handleUploadApply}
        renderers={{ upload: renderFilesUpload }}
        hideTabs={true}
      />
      <RenameFileModal
        open={renameModalState.open}
        fileId={renameModalState.fileId}
        currentFilename={renameModalState.currentFilename}
        onClose={() => setRenameModalState((prev) => ({ ...prev, open: false }))}
      />
      <DeleteFileModal
        disableScrollLock
        open={deleteModalState.open}
        onClose={() => setDeleteModalState({ open: false, fileId: null })}
        onConfirm={handleDeleteConfirm}
        file={fileForDeleteModal}
        isDeleting={isDeleting}
      />
    </Box>
  );
}
