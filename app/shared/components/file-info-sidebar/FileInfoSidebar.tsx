'use client';

import { Avatar, Box, IconButton, Link, Modal, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useCallback, useMemo, useState } from 'react';

import CloseIcon from '../../../../public/icons/close.svg';
import DownloadOutlinedIcon from '../../../../public/icons/download.svg';
import DeleteOutlineIcon from '../../../../public/icons/empty_trash.svg';
import EditOutlinedIcon from '../../../../public/icons/pen_line.svg';
import PictureIcon from '../../../../public/icons/picture.svg';
import StarBorderIcon from '../../../../public/icons/star.svg';
import AudioIcon from '../../../../public/icons/type-audio.svg';
import PdfIcon from '../../../../public/icons/type-pdf.svg';
import ZoomIn from '../../../../public/icons/zoom-in.svg';
import { colors } from '../design-system/button/Button.styles';
import { CustomTextField } from '../design-system/text-field/TextField';
import { styles } from './FileInfoSidebar.styles';

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

export type FileInfoSidebarProps = {
  file?: FileDetailsSidebarFile | null;

  onClose?: () => void;
  onToggleStar?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;

  onDescriptionChange?: (value: string) => void;
};

export function formatUsageCount(count: number): string {
  const n = Math.abs(count);
  const mod100 = n % 100;
  const mod10 = n % 10;

  if (mod100 >= 11 && mod100 <= 14) return `${count} звʼязок`;
  if (mod10 === 1) return `${count} звʼязка`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} звʼязки`;
  return `${count} звʼязок`;
}

const PREVIEW_PADDING = 40;

const TYPE_ICON: Record<FileDetailsSidebarFile['type'], React.ComponentType> = {
  image: PictureIcon,
  pdf: PdfIcon,
  audio: AudioIcon
};

export function FileInfoSidebar({ file, onClose, onToggleStar, onEdit, onDelete, onDownload }: FileInfoSidebarProps) {
  const filename = file?.filename ?? '—';
  const usageLinks = file?.usageLinks ?? [];
  const usageCount = usageLinks.length;
  const isStarred = file?.isStarred;

  const isImagePreview = useMemo(() => file?.type === 'image' && !!file?.previewUrl, [file?.type, file?.previewUrl]);

  const TypeIcon = file?.type ? TYPE_ICON[file.type] : PictureIcon;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Box sx={styles.section}>
      <Typography sx={styles.sectionTitle}>{title}</Typography>
      {children}
    </Box>
  );

  const RowText = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={styles.rowText}>{children}</Typography>
  );

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const openPreview = useCallback(() => {
    if (isImagePreview) setIsPreviewOpen(true);
  }, [isImagePreview]);

  const closePreview = useCallback(() => setIsPreviewOpen(false), []);

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
          <CloseIcon />
        </Box>
      </Box>
      <Box sx={styles.actionsRow}>
        <IconButton
          sx={{ ...styles.actionBtn, ...(isStarred ? styles.starFilled : {}) }}
          onClick={onToggleStar}
          aria-label="Toggle star"
        >
          <StarBorderIcon />
        </IconButton>

        <IconButton sx={styles.actionBtn} onClick={onEdit} aria-label="Edit file">
          <EditOutlinedIcon fontSize="small" />
        </IconButton>

        <IconButton sx={styles.actionBtn} onClick={onDelete} aria-label="Delete file">
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>

        <IconButton sx={styles.actionBtn} onClick={onDownload} aria-label="Download file">
          <DownloadOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box
        sx={{
          ...styles.preview,
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
              <Box
                className="previewOverlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(colors.blue[900], 0.4),
                  opacity: 0,
                  transition: 'opacity 300ms ease-out',
                  pointerEvents: 'none',
                  borderRadius: 'inherit'
                }}
              >
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
            No preview
          </Typography>
        )}
      </Box>
      {isImagePreview && (
        <Modal
          open={isPreviewOpen}
          onClose={closePreview}
          slotProps={{
            backdrop: {
              sx: {
                bgcolor: alpha(colors.blue[900], 0.4)
              }
            }
          }}
        >
          <Box
            onClick={closePreview}
            sx={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: `${PREVIEW_PADDING}px`,
              cursor: 'zoom-out',
              outline: 'none'
            }}
          >
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                cursor: 'default',
                maxWidth: `calc(100vw - ${PREVIEW_PADDING * 2}px)`,
                maxHeight: `calc(100vh - ${PREVIEW_PADDING * 2}px)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box
                component="img"
                src={file?.previewUrl ?? ''}
                alt={filename}
                sx={{
                  display: 'block',
                  objectFit: 'contain',
                  height: '100%',
                  width: 'auto',
                  cursor: 'default'
                }}
              />
            </Box>
          </Box>
        </Modal>
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
                    <Typography sx={styles.usageLink}>{u.label}</Typography>
                  )}
                </li>
              ))}
            </Box>
          )}
        </Section>

        <Section title="Опис">
          <CustomTextField fullWidth multiline minRows={2} placeholder="Додати опис" />
        </Section>
      </Box>
    </Box>
  );
}
