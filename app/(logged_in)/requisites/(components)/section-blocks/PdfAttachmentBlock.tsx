'use client';

import { Box, IconButton, Typography } from '@mui/material';
import { Trash2 } from 'lucide-react';
import React, { useRef } from 'react';
import toast from 'react-hot-toast';

import { styles } from './PdfAttachmentBlock.styles';
import { type PaymentDetailsPdfFile, REQUISITES_MESSAGES } from '~/constants/requisites';
import Button from '~/ds-components/button/Button';
import PdfIcon from '~/public/icons/type-pdf.svg';

interface PdfAttachmentBlockProps {
  file?: PaymentDetailsPdfFile | null;
  onFileChange: (file: PaymentDetailsPdfFile | null) => void;
  disabled?: boolean;
}

export const PdfAttachmentBlock: React.FC<PdfAttachmentBlockProps> = ({
  file,
  onFileChange,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleNativeFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      toast.error('Дозволено завантажувати лише файли у форматі PDF');
      event.target.value = '';
      return;
    }

    const newPdfFile: PaymentDetailsPdfFile = {
      filename: selectedFile.name,
      url: URL.createObjectURL(selectedFile),
      mimeType: selectedFile.type || 'application/pdf'
    };

    onFileChange(newPdfFile);
    event.target.value = '';
  };

  const handleDeleteFile = () => {
    onFileChange(null);
  };

  const PdfBadgeIcon = PdfIcon as React.ComponentType;

  return (
    <Box sx={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={handleNativeFileSelect}
        data-testid="pdf-file-input"
      />

      <Box sx={styles.headerRow}>
        <Typography sx={styles.label}>{REQUISITES_MESSAGES.PDF_SECTION_LABEL}</Typography>
        <Box sx={styles.dividerLine} />
        <Button
          variant="filled"
          color="primary"
          size="medium"
          onClick={handleTriggerFileInput}
          disabled={disabled}
          sx={styles.addButton}
        >
          {REQUISITES_MESSAGES.ADD_FILE_BUTTON}
        </Button>
      </Box>

      {file && (
        <Box sx={styles.fileCard} data-testid="attached-pdf-card">
          <Box sx={styles.fileInfo}>
            <Box sx={styles.pdfBadge}>
              <PdfBadgeIcon />
            </Box>
            <Typography sx={styles.fileName} title={file.filename}>
              {file.filename}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleDeleteFile}
            aria-label="Видалити файл"
            disabled={disabled}
            data-testid="delete-pdf-button"
            sx={styles.deleteButton}
          >
            <Trash2 size={20} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};
