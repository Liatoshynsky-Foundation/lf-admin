'use client';

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  SxProps,
  TextField,
  Theme,
  Typography
} from '@mui/material';
import React, { useRef, useState } from 'react';

import FileItem from '../../composition-modal/file-item/FileItem';
import { styles } from './ResearchModalView.styles';
import { sxToArray } from '~/lib/utils/sxToArray';

const KEYWORDS_MAX_LENGTH = 250;

export interface ResearchWorkFormData {
  bibliographicDescription: string;
  author: string;
  caseDates: string;
  keywords: string;
  file: File | null;
  fileName: string | null;
  url: string;
  isVisibleOnSite: boolean;
}

export interface ResearchModalViewProps {
  dialogTitle?: string;
  isOpen: boolean;
  initialData?: Partial<ResearchWorkFormData>;
  onClose: () => void;
  onSave: (data: ResearchWorkFormData) => Promise<void>;
  sx?: SxProps<Theme>;
}

const DEFAULT_DATA: ResearchWorkFormData = {
  bibliographicDescription: '',
  author: '',
  caseDates: '',
  keywords: '',
  file: null,
  fileName: null,
  url: '',
  isVisibleOnSite: true
};

export const ResearchModalView: React.FC<ResearchModalViewProps> = ({
  dialogTitle = 'Нова робота',
  isOpen,
  initialData,
  onClose,
  onSave,
  sx
}) => {
  const [bibliographicDescription, setBibliographicDescription] = useState(
    initialData?.bibliographicDescription ?? DEFAULT_DATA.bibliographicDescription
  );
  const [author, setAuthor] = useState(initialData?.author ?? DEFAULT_DATA.author);
  const [caseDates, setCaseDates] = useState(initialData?.caseDates ?? DEFAULT_DATA.caseDates);
  const [keywords, setKeywords] = useState(initialData?.keywords ?? DEFAULT_DATA.keywords);
  const [file, setFile] = useState<File | null>(initialData?.file ?? DEFAULT_DATA.file);
  const [fileName, setFileName] = useState<string | null>(initialData?.fileName ?? DEFAULT_DATA.fileName);
  const [url, setUrl] = useState(initialData?.url ?? DEFAULT_DATA.url);
  const [isVisibleOnSite, setIsVisibleOnSite] = useState(initialData?.isVisibleOnSite ?? DEFAULT_DATA.isVisibleOnSite);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setBibliographicDescription(DEFAULT_DATA.bibliographicDescription);
    setAuthor(DEFAULT_DATA.author);
    setCaseDates(DEFAULT_DATA.caseDates);
    setKeywords(DEFAULT_DATA.keywords);
    setFile(DEFAULT_DATA.file);
    setFileName(DEFAULT_DATA.fileName);
    setUrl(DEFAULT_DATA.url);
    setIsVisibleOnSite(DEFAULT_DATA.isVisibleOnSite);
    setIsSaving(false);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ bibliographicDescription, author, caseDates, keywords, file, fileName, url, isVisibleOnSite });
    resetForm();
  };

  const handleFileButtonClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
    }
    event.target.value = '';
  };

  const handleFileDelete = () => {
    setFile(null);
    setFileName(null);
  };

  const isFormValid = Boolean(bibliographicDescription.trim() && author.trim() && caseDates.trim() && keywords.trim());

  return (
    <Dialog disableScrollLock open={isOpen} sx={{ ...styles.dialog, ...sxToArray(sx) }} onClose={onClose} fullWidth>
      <DialogTitle sx={styles.dialogTitle}>{dialogTitle}</DialogTitle>

      <DialogContent sx={styles.dialogContent}>
        <Stack spacing={3} sx={styles.contentContainer}>
          <TextField
            label="Бібліографічний опис"
            value={bibliographicDescription}
            onChange={(e) => setBibliographicDescription(e.target.value)}
            required
            fullWidth
            multiline
            minRows={2}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Автор" value={author} onChange={(e) => setAuthor(e.target.value)} required fullWidth />
            <TextField
              label="Дати справи"
              value={caseDates}
              onChange={(e) => setCaseDates(e.target.value)}
              required
              fullWidth
            />
          </Stack>

          <Box>
            <TextField
              label="Ключові слова"
              value={keywords}
              onChange={(e) => e.target.value.length <= KEYWORDS_MAX_LENGTH && setKeywords(e.target.value)}
              required
              fullWidth
              multiline
              minRows={2}
            />
            <Typography variant="caption" sx={styles.charCounter}>
              {keywords.length}/{KEYWORDS_MAX_LENGTH}
            </Typography>
          </Box>

          <Stack spacing={2}>
            <Typography variant="subtitle2" sx={styles.fileSectionTitle}>
              Додайте файл або URL
            </Typography>

            <Stack direction="row" alignItems="center" spacing={0} sx={styles.fileRow}>
              <Typography variant="body2" sx={styles.fileLabel}>
                Файл
              </Typography>
              <Box sx={styles.fileRowDivider} />
              <Button variant="text" onClick={handleFileButtonClick} disabled={!!file} sx={styles.addFileButton}>
                Додати файл
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                data-testid="file-input"
              />
            </Stack>

            {fileName && <FileItem fileName={fileName} fileType="pdf" onDelete={handleFileDelete} />}

            <TextField label="URL" value={url} onChange={(e) => setUrl(e.target.value)} fullWidth disabled={!!file} />
          </Stack>

          <FormControlLabel
            control={<Checkbox checked={isVisibleOnSite} onChange={(e) => setIsVisibleOnSite(e.target.checked)} />}
            label="Показувати на сайті"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={styles.dialogActions}>
        <Button onClick={handleCancel} disabled={isSaving} variant="outlined" sx={styles.cancelButton}>
          Скасувати
        </Button>
        <Button
          variant="contained"
          color="tertiary"
          onClick={handleSave}
          disabled={!isFormValid || isSaving}
          disableElevation
          sx={styles.saveButton}
        >
          {isSaving ? 'Збереження...' : 'Зберегти'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
