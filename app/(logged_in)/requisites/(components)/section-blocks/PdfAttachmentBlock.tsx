'use client';

import { Box, IconButton, Typography } from '@mui/material';
import { Trash2 } from 'lucide-react';
import React from 'react';

import { styles } from './PdfAttachmentBlock.styles';
import { type PaymentDetailsPdfFile, REQUISITES_MESSAGES } from '~/constants/requisites';
import Button from '~/ds-components/button/Button';
import PdfIcon from '~/public/icons/type-pdf.svg';

interface PdfAttachmentBlockProps {
  file?: PaymentDetailsPdfFile | null;
  onAddFile: () => void;
  disabled?: boolean;
}

export const PdfAttachmentBlock: React.FC<PdfAttachmentBlockProps> = ({
  file,
  onAddFile,
  disabled = false
}) => {
  const PdfBadgeIcon = PdfIcon as React.ComponentType;

  return (
    <Box sx={styles.container}>
      <Box sx={styles.headerRow}>
        <Typography sx={styles.label}>{REQUISITES_MESSAGES.PDF_SECTION_LABEL}</Typography>
        <Box sx={styles.dividerLine} />
        <Button
          variant="filled"
          color="primary"
          size="medium"
          onClick={onAddFile}
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
            <Typography
              component="a"
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={styles.fileName}
              title={file.filename}
            >
              {file.filename}
            </Typography>
          </Box>
          <IconButton
            size="small"
            aria-label="Видалити файл"
            disabled
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
