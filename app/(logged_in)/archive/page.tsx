'use client';

import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { ControlPanel } from '~/shared/components/control-panel';
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
import { ViewToggle } from '~/shared/components/view-toggle';
import { useAllAssets } from '~/shared/hooks/use-assets/useAssets';
import { AssetType } from '~/types/graphql/generated/graphql';

type ArchiveFileItem = FilesCardsLayoutItem & {
  description?: string;
  format?: string;
  size?: string;
  previewUrl?: string;
  addedBy?: { name: string; avatarUrl?: string };
  usage: FileUsageLink[];
};

const fileTypeMap: Record<AssetType, FilesCardsLayoutItem['type']> = {
  [AssetType.Image]: 'image',
  [AssetType.Pdf]: 'pdf',
  [AssetType.Audio]: 'audio'
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
  const byMime = mimeType.split('/')[1]?.toUpperCase();
  if (byMime) return byMime;

  const ext = filename.split('.').pop()?.toUpperCase();
  return ext || undefined;
};

const usageToLink = (pageId?: string | null) => {
  if (!pageId) {
    return undefined;
  }

  return pageId.startsWith('/') ? pageId : `/${pageId}`;
};

export default function ArchivePage() {
  const [view, setView] = useState<FilesCardsLayoutView>('grid');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);
  const { data, loading, error } = useAllAssets();

  const files = useMemo<ArchiveFileItem[]>(() => {
    return (data?.allAssets ?? []).map((asset) => ({
      id: asset.id,
      type: fileTypeMap[asset.type],
      name: asset.filename,
      dateAdded: formatDateAdded(asset.createdAt),
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

  useEffect(() => {
    if (!files.length) {
      setSelectedFileId(null);
      setHasInitializedSelection(false);
      return;
    }

    if (!hasInitializedSelection) {
      setSelectedFileId(files[0].id);
      setHasInitializedSelection(true);
      return;
    }

    if (selectedFileId && !files.some((file) => file.id === selectedFileId)) {
      setSelectedFileId(files[0].id);
    }
  }, [files, hasInitializedSelection, selectedFileId]);

  const selectedFile = useMemo(() => files.find((file) => file.id === selectedFileId) ?? null, [files, selectedFileId]);

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
        gap: '24px',
        pr: { xs: 0, md: sidebarFile ? `${SIDEBAR_WIDTH + 24}px` : 0 },
        transition: 'padding-right 0.2s ease'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <Typography variant="h4">Файли</Typography>
      </Box>

      <ControlPanel
        leftContent={
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <OutlinedInput
              placeholder="Пошук"
              disabled
              fullWidth
              startAdornment={
                <InputAdornment position="start" sx={{ color: colors.blue[800] }}>
                  <SearchRoundedIcon />
                </InputAdornment>
              }
              sx={{
                maxWidth: '456px',
                borderRadius: '12px',
                height: '56px',
                bgcolor: colors.white,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.blue[500]
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.blue[600]
                },
                '& .MuiOutlinedInput-input': {
                  fontSize: '24px'
                }
              }}
            />
          </Box>
        }
        rightContent={
          <>
            <Button
              variant="outlined"
              startIcon={<FilterListRoundedIcon />}
              disabled
              sx={{
                borderRadius: '999px',
                px: '24px',
                py: '10px',
                minHeight: '56px',
                textTransform: 'none',
                borderColor: colors.black,
                color: colors.black,
                bgcolor: colors.white,
                '&:hover': {
                  borderColor: colors.black,
                  bgcolor: colors.blue[50]
                }
              }}
            >
              Фільтри
            </Button>

            <ViewToggle value={view} onChange={setView} />
          </>
        }
      />

      <FilesCardsLayout view={view} items={files} onItemClick={(item) => setSelectedFileId(item.id)} />

      {loading && <Typography>Завантаження файлів…</Typography>}
      {error && <Typography color="error">Не вдалося завантажити файли.</Typography>}

      {sidebarFile && (
        <FileInfoSidebar
          file={sidebarFile}
          onClose={() => setSelectedFileId(null)}
        />
      )}
    </Box>
  );
}
