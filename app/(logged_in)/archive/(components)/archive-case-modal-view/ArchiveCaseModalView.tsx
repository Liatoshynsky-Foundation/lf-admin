'use client';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material';
import { X } from 'lucide-react';
import React from 'react';

import { styles } from './ArchiveCaseModalView.styles';
import { ARCHIVE_CASE_MODAL_LABELS, PdfEntry } from '~/constants/archive';
import ActionableSuggestItem from '~/shared/components/composition-modal/actionable-suggest-item/ActionableSuggestItem';
import FileItem from '~/shared/components/composition-modal/file-item/FileItem';
import LabelActionRow from '~/shared/components/composition-modal/label-action-row/LabelActionRow';
import LabelRow from '~/shared/components/composition-modal/label-row/LabelRow';

export interface ArchiveCaseModalViewProps {
  isOpen: boolean;
  onClose: () => void;
  descriptionNumber: string;
  setDescriptionNumber: (value: string) => void;
  caseNumber: string;
  setCaseNumber: (value: string) => void;
  sheetsNumber: string;
  setSheetsNumber: (value: string) => void;
  caseDate: string;
  setCaseDate: (value: string) => void;
  currentPdfFile: PdfEntry;
  detailedCaseDescription: string;
  setDetailedCaseDescription: (value: string) => void;
  caseName: string;
  setCaseName: (value: string) => void;
  caseDescriptions: string;
  setCaseDescriptions: (value: string) => void;
  handleOpenUploadFlow: () => void;
  handleDeletePdf: () => void;
  handleSelectPdfSuggestion: (name: string | null) => void;
  pdfFileSuggestions: string[];
  handleSave: () => void;
  handleCancel: () => void;
  isSubmitDisabled: boolean;
}

export const ArchiveCaseModalView = ({
  isOpen,
  onClose,
  descriptionNumber,
  setDescriptionNumber,
  caseNumber,
  setCaseNumber,
  sheetsNumber,
  setSheetsNumber,
  caseDate,
  setCaseDate,
  currentPdfFile,
  detailedCaseDescription,
  setDetailedCaseDescription,
  caseName,
  setCaseName,
  caseDescriptions,
  setCaseDescriptions,
  handleOpenUploadFlow,
  handleDeletePdf,
  handleSelectPdfSuggestion,
  pdfFileSuggestions,
  handleSave,
  handleCancel,
  isSubmitDisabled,
}: ArchiveCaseModalViewProps) => {
  return (
    <Dialog disableScrollLock open={isOpen} sx={{ ...styles.dialog }} onClose={onClose} fullWidth>
      <DialogTitle sx={styles.dialogHeaderBox}>
        <Typography sx={styles.dialogTitle}>{ARCHIVE_CASE_MODAL_LABELS.title}</Typography>
        <IconButton aria-label="Закрити" onClick={onClose} sx={styles.closeButton}>
          <X size={24} strokeWidth={1.5} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={styles.dialogContent}>
        <Stack spacing={4} sx={styles.contentContainer}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label={ARCHIVE_CASE_MODAL_LABELS.description}
                value={descriptionNumber}
                onChange={(e) => setDescriptionNumber(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label={ARCHIVE_CASE_MODAL_LABELS.caseNumber}
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                required
                fullWidth
              />
            </Stack>
            <TextField
              label={ARCHIVE_CASE_MODAL_LABELS.caseName}
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
              required
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                sx={styles.shortTextField}
                label={ARCHIVE_CASE_MODAL_LABELS.sheets}
                value={sheetsNumber}
                onChange={(e) => setSheetsNumber(e.target.value)}
                required
              />
              <TextField
                sx={styles.shortTextField}
                label={ARCHIVE_CASE_MODAL_LABELS.caseDates}
                value={caseDate}
                onChange={(e) => setCaseDate(e.target.value)}
                required
              />
            </Stack>
            <TextField
              label={ARCHIVE_CASE_MODAL_LABELS.documentsComposition}
              value={caseDescriptions}
              onChange={(e) => setCaseDescriptions(e.target.value)}
              required
              fullWidth
            />
            <Box>
              <LabelActionRow
                title={ARCHIVE_CASE_MODAL_LABELS.file}
                action={handleOpenUploadFlow}
                actionButtonText={ARCHIVE_CASE_MODAL_LABELS.addFile}
                disabled={!!currentPdfFile.fileName}
              />

              <Stack spacing={2} sx={styles.sectionStack}>
                <Stack spacing="10px">
                  {currentPdfFile.fileName ? (
                    <Box sx={styles.fileItemWrapper}>
                      <FileItem
                        fileName={currentPdfFile.fileName}
                        fileType="pdf"
                        onDelete={handleDeletePdf}
                      />
                    </Box>
                  ) : (
                    <ActionableSuggestItem
                      mode="pdf"
                      suggestions={pdfFileSuggestions}
                      onSelect={handleSelectPdfSuggestion}
                      onUpload={handleOpenUploadFlow}
                      onDelete={handleDeletePdf}
                    />
                  )}
                </Stack>
              </Stack>
            </Box>

            <Stack spacing={2}>
              <LabelRow title={ARCHIVE_CASE_MODAL_LABELS.detailedDescription} />
              <TextField
                multiline
                label={ARCHIVE_CASE_MODAL_LABELS.documents}
                rows={3}
                value={detailedCaseDescription}
                onChange={(e) => setDetailedCaseDescription(e.target.value)}
                fullWidth
                sx={styles.multilineTextField}
              />
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={styles.dialogActions}>
        <Button variant="outlined" sx={styles.cancelButton} onClick={handleCancel} disabled={isSubmitDisabled}>
          {ARCHIVE_CASE_MODAL_LABELS.cancel}
        </Button>
        <Button
          variant="contained"
          color="tertiary"
          disableElevation
          sx={styles.saveButton}
          onClick={handleSave}
          disabled={isSubmitDisabled}
        >
          {ARCHIVE_CASE_MODAL_LABELS.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
