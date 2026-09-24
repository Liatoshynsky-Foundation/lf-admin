'use client';

import {
  Autocomplete,
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
import { useState } from 'react';

import FileItem from '../../composition-modal/file-item/FileItem';
import { styles } from './ResearchModalView.styles';
import {
  RESEARCH_FIELD_LIMITS,
  RESEARCH_MODAL_TITLE,
  RESEARCH_URL_PLACEHOLDER,
  RESEARCH_VALIDATION_MESSAGES
} from '~/constants/research';
import { isValidHttpUrl } from '~/lib/utils/isValidUrl';
import { sxToArray } from '~/lib/utils/sxToArray';

const clampLength = (value: string, maxLength: number) => value.slice(0, maxLength);

type TouchedFields = Readonly<{
  bibliographicDescription: boolean;
  author: boolean;
  caseDates: boolean;
  url: boolean;
}>;

const DEFAULT_TOUCHED: TouchedFields = {
  bibliographicDescription: false,
  author: false,
  caseDates: false,
  url: false
};

export interface ResearchWorkFormData {
  bibliographicDescription: string;
  author: string;
  caseDates: string;
  keywords: string;
  url: string;
  isVisibleOnSite: boolean;
}

export interface ResearchModalViewProps {
  dialogTitle?: string;
  isOpen: boolean;
  initialData?: Partial<ResearchWorkFormData>;
  authorOptions?: string[];
  attachedFileName?: string | null;
  onAddFile: () => void;
  onDeleteFile: () => void;
  onClose: () => void;
  onSave: (data: ResearchWorkFormData) => Promise<void>;
  sx?: SxProps<Theme>;
}

const DEFAULT_DATA: ResearchWorkFormData = {
  bibliographicDescription: '',
  author: '',
  caseDates: '',
  keywords: '',
  url: '',
  isVisibleOnSite: true
};

const requiredError = (value: string, touched: boolean, message: string): string | undefined =>
  touched && !value.trim() ? message : undefined;

export const ResearchModalView = ({
  dialogTitle = RESEARCH_MODAL_TITLE,
  isOpen,
  initialData,
  authorOptions = [],
  attachedFileName = null,
  onAddFile,
  onDeleteFile,
  onClose,
  onSave,
  sx
}: ResearchModalViewProps) => {
  const [bibliographicDescription, setBibliographicDescription] = useState(
    initialData?.bibliographicDescription ?? DEFAULT_DATA.bibliographicDescription
  );
  const [author, setAuthor] = useState(initialData?.author ?? DEFAULT_DATA.author);
  const [caseDates, setCaseDates] = useState(initialData?.caseDates ?? DEFAULT_DATA.caseDates);
  const [keywords, setKeywords] = useState(initialData?.keywords ?? DEFAULT_DATA.keywords);
  const [url, setUrl] = useState(initialData?.url ?? DEFAULT_DATA.url);
  const [isVisibleOnSite, setIsVisibleOnSite] = useState(initialData?.isVisibleOnSite ?? DEFAULT_DATA.isVisibleOnSite);
  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched] = useState<TouchedFields>(DEFAULT_TOUCHED);

  const markTouched = (field: keyof TouchedFields) => {
    setTouched((previous) => ({ ...previous, [field]: true }));
  };

  const resetForm = () => {
    setBibliographicDescription(DEFAULT_DATA.bibliographicDescription);
    setAuthor(DEFAULT_DATA.author);
    setCaseDates(DEFAULT_DATA.caseDates);
    setKeywords(DEFAULT_DATA.keywords);
    setUrl(DEFAULT_DATA.url);
    setIsVisibleOnSite(DEFAULT_DATA.isVisibleOnSite);
    setIsSaving(false);
    setTouched(DEFAULT_TOUCHED);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ bibliographicDescription, author, caseDates, keywords, url, isVisibleOnSite });
      resetForm();
    } catch {
      return;
    } finally {
      setIsSaving(false);
    }
  };

  const isUrlValid = !url.trim() || isValidHttpUrl(url.trim());
  const bibliographicDescriptionError = requiredError(
    bibliographicDescription,
    touched.bibliographicDescription,
    RESEARCH_VALIDATION_MESSAGES.bibliographicDescriptionRequired
  );
  const authorError = requiredError(author, touched.author, RESEARCH_VALIDATION_MESSAGES.authorRequired);
  const caseDatesError = requiredError(caseDates, touched.caseDates, RESEARCH_VALIDATION_MESSAGES.yearRequired);
  const urlError = touched.url && !isUrlValid ? RESEARCH_VALIDATION_MESSAGES.urlInvalid : undefined;

  const isFormValid = Boolean(bibliographicDescription.trim() && author.trim() && caseDates.trim() && isUrlValid);
  const hasAttachedFile = Boolean(attachedFileName);

  return (
    <Dialog disableScrollLock open={isOpen} sx={{ ...styles.dialog, ...sxToArray(sx) }} onClose={handleCancel} fullWidth>
      <DialogTitle sx={styles.dialogTitle}>{dialogTitle}</DialogTitle>

      <DialogContent sx={styles.dialogContent}>
        <Stack spacing={3} sx={styles.contentContainer}>
          <TextField
            label="Бібліографічний опис"
            value={bibliographicDescription}
            onChange={(e) =>
              setBibliographicDescription(clampLength(e.target.value, RESEARCH_FIELD_LIMITS.bibliographicDescription))
            }
            onBlur={() => markTouched('bibliographicDescription')}
            error={Boolean(bibliographicDescriptionError)}
            helperText={bibliographicDescriptionError}
            required
            fullWidth
            multiline
            minRows={1}
            maxRows={2}
            inputProps={{ maxLength: RESEARCH_FIELD_LIMITS.bibliographicDescription }}
            sx={styles.multilineField}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Autocomplete
              freeSolo
              fullWidth
              options={authorOptions}
              inputValue={author}
              onInputChange={(_, value) => setAuthor(clampLength(value, RESEARCH_FIELD_LIMITS.author))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Автор"
                  required
                  fullWidth
                  error={Boolean(authorError)}
                  helperText={authorError}
                  onBlur={() => markTouched('author')}
                  inputProps={{ ...params.inputProps, maxLength: RESEARCH_FIELD_LIMITS.author }}
                />
              )}
            />
            <TextField
              label="Дати справи"
              value={caseDates}
              onChange={(e) => setCaseDates(clampLength(e.target.value, RESEARCH_FIELD_LIMITS.year))}
              onBlur={() => markTouched('caseDates')}
              error={Boolean(caseDatesError)}
              helperText={caseDatesError}
              required
              fullWidth
              inputProps={{ maxLength: RESEARCH_FIELD_LIMITS.year }}
            />
          </Stack>

          <Box>
            <TextField
              label="Ключові слова"
              value={keywords}
              onChange={(e) => setKeywords(clampLength(e.target.value, RESEARCH_FIELD_LIMITS.keywords))}
              fullWidth
              multiline
              minRows={1}
              maxRows={2}
              inputProps={{ maxLength: RESEARCH_FIELD_LIMITS.keywords }}
              sx={styles.multilineField}
            />
            <Typography variant="caption" sx={styles.charCounter}>
              {keywords.length}/{RESEARCH_FIELD_LIMITS.keywords}
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
              <Button
                variant="text"
                onClick={onAddFile}
                disabled={hasAttachedFile}
                sx={styles.addFileButton}
              >
                Додати файл
              </Button>
            </Stack>

            {attachedFileName && (
              <FileItem fileName={attachedFileName} fileType="pdf" onDelete={onDeleteFile} />
            )}

            <TextField
              label="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => markTouched('url')}
              placeholder={RESEARCH_URL_PLACEHOLDER}
              fullWidth
              error={Boolean(urlError)}
              helperText={urlError}
            />
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
