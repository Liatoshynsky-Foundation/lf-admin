import { Avatar, Box, IconButton, Link, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import TooltipCustom from '../design-system/tooltip/Tooltip';
import { styles } from './FileInfoSidebar.styles';
import { ImagePreviewModal } from './image-preview-modal/ImagePreviewModal';
import { useAutosavedDescription } from './useAutosavedDescription';
import { formatUsageCount } from '~/lib/utils/formatUsageCount';
import CloseIcon from '~/public/icons/close.svg';
import DocIcon from '~/public/icons/doc.svg';
import DownloadOutlinedIcon from '~/public/icons/download.svg';
import DeleteOutlineIcon from '~/public/icons/empty-trash.svg';
import EditOutlinedIcon from '~/public/icons/pen-line.svg';
import PictureIcon from '~/public/icons/picture.svg';
import StarBorderIcon from '~/public/icons/small-star.svg';
import AudioIcon from '~/public/icons/type-audio.svg';
import PdfIcon from '~/public/icons/type-pdf.svg';
import VideoFileIcon from '~/public/icons/video-file.svg';
import XlsIcon from '~/public/icons/xls.svg';
import ArchiveIcon from '~/public/icons/zip.svg';
import ZoomIn from '~/public/icons/zoom-in.svg';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import { useUpdateAssetMutation } from '~/types/graphql/generated/graphql';

export type FileUsageLink = {
  id: string;
  label: string;
  href?: string;
};

export type FileDetailsSidebarFile = {
  id: string;
  type: 'image' | 'pdf' | 'audio' | 'document' | 'spreadsheet' | 'video' | 'archive';
  filename: string;
  previewUrl?: string;

  addedBy?: { name: string; avatarUrl?: string };
  addedAt?: string;

  format?: string;
  size?: string;

  usageLinks?: FileUsageLink[];
  description?: string;
  isStarred?: boolean;
};

export type FileSidebarAction =
  | { type: 'rename'; fileId: string }
  | { type: 'delete'; fileId: string }
  | { type: 'download'; fileId: string };

export type FileInfoSidebarProps = {
  file?: FileDetailsSidebarFile | null;

  onClose: () => void;

  onToggleStar?: (fileId: string, next: boolean) => void;
  onDescriptionSave?: (fileId: string, description: string) => Promise<void> | void;

  onRequestAction?: (action: FileSidebarAction) => void;
};

const AUTOSAVE_DEBOUNCE_MS = 1800;

const TYPE_ICON: Record<FileDetailsSidebarFile['type'], React.ComponentType> = {
  image: PictureIcon,
  pdf: PdfIcon,
  audio: AudioIcon,
  document: DocIcon,
  spreadsheet: XlsIcon,
  video: VideoFileIcon,
  archive: ArchiveIcon
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={styles.section}>
    <Typography variant='textSm' sx={styles.sectionTitle}>{title}</Typography>
    {children}
  </Box>
);

const RowText = ({ children }: { children: React.ReactNode }) => (
  <Typography variant='textMd' sx={styles.rowText}>{children}</Typography>
);

export function FileInfoSidebar({ file, onClose, onDescriptionSave, onRequestAction }: Readonly<FileInfoSidebarProps>) {
  const theme = useTheme();
  const fileId = file?.id;
  const filename = file?.filename ?? '—';
  const usageLinks = file?.usageLinks ?? [];
  const usageCount = usageLinks.length;
  const isStarred = !!file?.isStarred;
  const canEdit = !!fileId;
  const isImagePreview = file?.type === 'image' && !!file?.previewUrl;
  const TypeIcon = file?.type ? TYPE_ICON[file.type] : PictureIcon;

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const openPreview = useCallback(() => {
    if (isImagePreview) setIsPreviewOpen(true);
  }, [isImagePreview]);

  const closePreview = useCallback(() => setIsPreviewOpen(false), []);

  const {
    draft: descDraft,
    setDraft: setDescDraft,
    commit: commitDescription
  } = useAutosavedDescription({
    fileId,
    initialValue: file?.description ?? '',
    debounceMs: AUTOSAVE_DEBOUNCE_MS,
    onSave: onDescriptionSave
  });

  const requestAction = useCallback(
    (type: FileSidebarAction['type']) => {
      if (!fileId) return;
      onRequestAction?.({ type, fileId });
    },
    [fileId, onRequestAction]
  );

  const [updateAsset, { loading: isUpdatingStar }] = useUpdateAssetMutation();

  const handleStarToggle = async () => {
    if (!file?.id) return;

    try {
      await updateAsset({
        variables: {
          id: file.id,
          input: { isStarred: !isStarred }
        }
      });
    } catch {}
  };

  return (
    <Box sx={styles.root}>
      <Box sx={styles.header}>
        <Box sx={styles.headerIcon}>
          <TypeIcon />
        </Box>

        <Typography variant='bodyMd' sx={styles.headerTitle} title={filename}>
          {filename}
        </Typography>

        <Box sx={styles.closeBtn} onClick={onClose} aria-label="Close sidebar">
          <CloseIcon height={24} width={24} />
        </Box>
      </Box>

      <Box sx={styles.actionsRow}>
        <TooltipCustom title={isStarred ? 'Забрати з обраних' : 'Додати в обрані'} showArrow>
          <IconButton
            sx={{ ...styles.actionBtn, ...(isStarred ? styles.starFilled : {}) }}
            onClick={handleStarToggle}
            aria-label={isStarred ? 'Забрати з обраних' : 'Додати в обрані'}
            disabled={!canEdit || isUpdatingStar}
          >
            <StarBorderIcon />
          </IconButton>
        </TooltipCustom>

        <TooltipCustom title="Перейменувати" showArrow>
          <IconButton
            sx={styles.actionBtn}
            onClick={() => requestAction('rename')}
            aria-label="Перейменувати"
            disabled={!canEdit}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </TooltipCustom>

        <TooltipCustom title="Видалити" showArrow>
          <IconButton
            sx={styles.actionBtn}
            onClick={() => requestAction('delete')}
            aria-label="Видалити"
            disabled={!canEdit}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </TooltipCustom>

        <TooltipCustom title="Завантажити" showArrow>
          <IconButton
            sx={styles.actionBtn}
            onClick={() => requestAction('download')}
            aria-label="Завантажити"
            disabled={!canEdit}
          >
            <DownloadOutlinedIcon fontSize="small" />
          </IconButton>
        </TooltipCustom>
      </Box>

      <Box
        sx={{
          ...styles.preview(isImagePreview),
          cursor: isImagePreview ? 'pointer' : 'default'
        }}
        onClick={openPreview}
        role={isImagePreview ? 'button' : undefined}
        tabIndex={isImagePreview ? 0 : -1}
        onKeyDown={(e) => {
          if (!isImagePreview) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPreview();
          }
        }}
      >
        {file?.previewUrl ? (
          <>
            <Box component="img" src={file.previewUrl} alt={filename} sx={styles.previewImg} />

            {isImagePreview && (
              <Box className="previewOverlay" sx={styles.previewOverlay}>
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    openPreview();
                  }}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Open image preview"
                  role="button"
                  tabIndex={-1}
                >
                  <ZoomIn />
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Немає попереднього перегляду
          </Typography>
        )}
      </Box>

      {isImagePreview && (
        <ImagePreviewModal open={isPreviewOpen} src={file?.previewUrl ?? ''} alt={filename} onClose={closePreview} />
      )}

      <Box sx={styles.lastBlock}>
        <Section title="Хто додав">
          <Box sx={styles.userRow}>
            <Avatar src={file?.addedBy?.avatarUrl} alt={file?.addedBy?.name ?? 'User Avatar'} sx={styles.userAvatar} />
            <RowText>{file?.addedBy?.name ?? '—'}</RowText>
          </Box>
        </Section>

        <Section title="Дата додавання">
          <RowText>{file?.addedAt ?? '—'}</RowText>
        </Section>

        <Section title="Деталі файлу">
          <Box sx={styles.columnText}>
            <RowText>Формат: {file?.format ?? '—'}</RowText>
            <RowText>Розмір: {file?.size ?? '—'}</RowText>
          </Box>
        </Section>

        <Section title={`Використання на сайті - ${formatUsageCount(usageCount)}`}>
          {usageCount === 0 ? (
            <Typography sx={styles.rowText} color="text.secondary">
              —
            </Typography>
          ) : (
            <Box component="ul" sx={styles.usageLinks}>
              {usageLinks.map((u) => (
                <li key={u.id}>
                  {u.href ? (
                    <Link href={u.href} sx={styles.usageLink} underline="none">
                      {u.label}
                    </Link>
                  ) : (
                    <Typography variant='bodyMd' sx={styles.usageLink}>{u.label}</Typography>
                  )}
                </li>
              ))}
            </Box>
          )}
        </Section>

        <Section title="Опис">
          <CustomTextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Додати опис"
            value={descDraft}
            disabled={!canEdit}
            onChange={(e) => setDescDraft(e.target.value)}
            onBlur={() => {
              commitDescription(descDraft);
            }}
            sx={styles.descriptionField(theme)}
          />
        </Section>
      </Box>
    </Box>
  );
}
