'use client';

import CloseIcon from '@mui/icons-material/Close';
import { Avatar, Box, IconButton, Link, TextField, Typography } from '@mui/material';
import React from 'react';

import DownloadOutlinedIcon from '../../../../public/icons/download.svg';
import DeleteOutlineIcon from '../../../../public/icons/empty_trash.svg';
import EditOutlinedIcon from '../../../../public/icons/pen_line.svg';
import PictureIcon from '../../../../public/icons/picture.svg';
import StarBorderIcon from '../../../../public/icons/star.svg';
import { styles } from './FileInfoSidebar.styles';

export type FileUsageLink = {
  id: string;
  label: string;
  href?: string;
};

export type FileDetailsSidebarFile = {
  id: string;
  filename: string;
  previewUrl?: string;

  addedBy?: { name: string; avatarUrl?: string };
  addedAt?: string;

  format?: string;
  size?: string;

  usageLinks?: FileUsageLink[];
  description?: string;
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

export function FileInfoSidebar({
  file,
  onClose,
  onToggleStar,
  onEdit,
  onDelete,
  onDownload,
  onDescriptionChange
}: FileInfoSidebarProps) {
  const filename = file?.filename ?? '—';
  const usageLinks = file?.usageLinks ?? [];
  const usageCount = usageLinks.length;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Box sx={styles.section}>
      <Typography sx={styles.sectionTitle}>{title}</Typography>
      {children}
    </Box>
  );

  const RowText = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={styles.rowText}>{children}</Typography>
  );

  return (
    <Box sx={styles.root}>
      <Box sx={styles.header}>
        <Box sx={styles.headerIcon}>
          <PictureIcon />
        </Box>

        <Typography sx={styles.headerTitle} title={filename}>
          {filename}
        </Typography>

        <IconButton onClick={onClose} sx={styles.closeBtn} aria-label="Close sidebar">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={styles.actionsRow}>
        <IconButton sx={styles.actionBtn} onClick={onToggleStar} aria-label="Toggle star">
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

      <Box sx={styles.preview}>
        {file?.previewUrl ? (
          <Box component="img" src={file.previewUrl} alt={filename} sx={styles.previewImg} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No preview
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

        <Section title={`Використання на сайті - ${usageCount} звʼязки`}>
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
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Додати опис"
            value={file?.description ?? ''}
            onChange={(e) => onDescriptionChange?.(e.target.value)}
            sx={styles.descriptionField}
          />
        </Section>
      </Box>
    </Box>
  );
}
