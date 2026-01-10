import { Avatar, Box, IconButton, Link, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import TooltipCustom from '../design-system/tooltip/Tooltip';
import { styles } from './FileInfoSidebar.styles';
import { useAutosavedDescription } from './useAutosavedDescription';
import { formatUsageCount } from '~/lib/utils/formatUsageCount';
import CloseIcon from '~/public/icons/close.svg';
import DownloadOutlinedIcon from '~/public/icons/download.svg';
import DeleteOutlineIcon from '~/public/icons/empty-trash.svg';
import EditOutlinedIcon from '~/public/icons/pen-line.svg';
import PictureIcon from '~/public/icons/picture.svg';
import StarBorderIcon from '~/public/icons/small-star.svg';
import AudioIcon from '~/public/icons/type-audio.svg';
import PdfIcon from '~/public/icons/type-pdf.svg';
import ZoomIn from '~/public/icons/zoom-in.svg';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

export type FileUsageLink = {
  id: string;
  label: string;
  href?: string;
};

export type FileDetailsSidebarFile = {
  id: string;
  type: 'image' | 'pdf' | 'audio';
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
  audio: AudioIcon
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={styles.section}>
    <Typography sx={styles.sectionTitle}>{title}</Typography>
    {children}
  </Box>
);

const RowText = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={styles.rowText}>{children}</Typography>
);

export function FileInfoSidebar({
  file,
  onClose,
  onToggleStar,
  onDescriptionSave,
  onRequestAction
}: Readonly<FileInfoSidebarProps>) {
  const fileId = file?.id;
  const filename = file?.filename ?? '—';
  const usageLinks = file?.usageLinks ?? [];
  const usageCount = usageLinks.length;
  const isStarred = !!file?.isStarred;
  const canEdit = !!fileId;
  const isImagePreview = file?.type === 'image' && !!file?.previewUrl;
  const TypeIcon = file?.type ? TYPE_ICON[file.type] : PictureIcon;

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

  return (
    <Box sx={styles.root}>
      <Box sx={styles.header}>
        <Box sx={styles.headerIcon}>
          <TypeIcon />
        </Box>

        <Typography sx={styles.headerTitle} title={filename}>
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
            onClick={() => fileId && onToggleStar?.(fileId, !isStarred)}
            aria-label={isStarred ? 'Забрати з обраних' : 'Додати в обрані'}
            disabled={!canEdit}
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

      <Box sx={styles.preview(isImagePreview)}>
        {file?.previewUrl ? (
          <>
            <Box component="img" src={file.previewUrl} alt={filename} sx={styles.previewImg} />

            {isImagePreview && (
              <Box className="previewOverlay" sx={styles.previewOverlay}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    <Typography sx={styles.usageLink}>{u.label}</Typography>
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
          />
        </Section>
      </Box>
    </Box>
  );
}
