'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';

import { MediaModalContainer } from './components/container/MediaModalContainer';
import { styles } from './MediaModal.styles';
import type { UploadMedia } from './MediaModal.types';
import { UploadView } from './views/upload-view/UploadView';
import ArrowLeftIcon from '~/public/icons/arrowLeft.svg';
import Button from '~/shared/components/design-system/button/Button';

type FileUploadModalProps = {
  open: boolean;
  onClose: () => void;
  onApply: (file: File) => Promise<void> | void;
  accept: string;
  invalidFileError: string;
  isAllowedFile: (file: File) => boolean;
};

const getIconNameForFile = (file: File): string => {
  if (file.type.startsWith('image/')) return 'img';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.includes('pdf')) return 'pdf';
  if (file.type.includes('spreadsheet') || file.type.includes('excel')) return 'xls';
  if (
    file.type.includes('zip') ||
    file.type.includes('rar') ||
    file.type.includes('compressed') ||
    file.name.toLowerCase().endsWith('.rar')
  ) {
    return 'zip';
  }
  return 'doc';
};

export function FileUploadModal({
  open,
  onClose,
  onApply,
  accept,
  invalidFileError,
  isAllowedFile
}: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handlePick = (media: UploadMedia) => {
    setSelectedFile(media.file);
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  const handleApply = async () => {
    if (selectedFile) {
      setIsApplying(true);
      try {
        await onApply(selectedFile);
        handleClose();
      } finally {
        setIsApplying(false);
      }
    }
  };

  const headerLeft = <Typography sx={styles.cropHeaderTitle}>Завантажити файл</Typography>;

  const footerLeft = selectedFile ? (
    <Button
      color="secondary"
      variant="outlined"
      label="Повернутись назад"
      sx={styles.footerBackButton}
      startIcon={<ArrowLeftIcon width={12} height={12} aria-hidden focusable={false} />}
      onClick={() => setSelectedFile(null)}
      disabled={isApplying}
    />
  ) : null;

  const footerRight = selectedFile ? (
    <>
      <Button color="secondary" variant="outlined" label="Скасувати" onClick={handleClose} disabled={isApplying} />
      <Button
        color="tertiary"
        variant="filled"
        label="Застосувати"
        onClick={handleApply}
        loading={isApplying}
        disabled={isApplying}
      />
    </>
  ) : null;

  return (
    <MediaModalContainer
      open={open}
      onClose={handleClose}
      headerLeft={headerLeft}
      footerLeft={footerLeft}
      footerRight={footerRight}
      dataTestId="FileUploadModal"
    >
      {!selectedFile ? (
        <UploadView
          selected={null}
          onPick={handlePick}
          accept={accept}
          invalidFileError={invalidFileError}
          isAllowedFile={isAllowedFile}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            width: '100%',
            height: '100%',
            minHeight: '300px',
            border: '2px dashed rgba(193, 201, 214, 0.4)',
            borderRadius: '16px'
          }}
        >
          <Image src={`/icons/${getIconNameForFile(selectedFile)}.svg`} width={80} height={80} alt="File icon" />

          <Typography sx={styles.cropHeaderTitle}>{selectedFile.name}</Typography>
          <Typography sx={styles.cropHeaderSubtitle}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Typography>
        </Box>
      )}
    </MediaModalContainer>
  );
}
