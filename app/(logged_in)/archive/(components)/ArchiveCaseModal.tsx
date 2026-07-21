'use client';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import React from 'react';

import { styles } from './ArchiveCaseModal.styles';
import {
  ARCHIVE_CASE_MODAL_LABELS,
  PDF_FILE_ACCEPT,
} from '~/constants/archive';
import ActionableSuggestItem from '~/shared/components/composition-modal/actionable-suggest-item/ActionableSuggestItem';
import FileItem from '~/shared/components/composition-modal/file-item/FileItem';
import LabelActionRow from '~/shared/components/composition-modal/label-action-row/LabelActionRow';
import LabelRow from '~/shared/components/composition-modal/label-row/LabelRow';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import UploadView from '~/shared/components/media-modal/views/upload-view/UploadView';
import { useArchiveCaseModal } from '~/shared/hooks/use-archive-case-modal/useArchiveCaseModal';

interface ArchiveCaseModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const ArchiveCaseModal = ({ isOpen, setIsOpen }: ArchiveCaseModalProps) => {
  const {
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
    isUploadModalOpen,
    handleOpenUploadFlow,
    handleCloseUploadFlow,
    isAllowedPdfFile,
    handleApplyPdf,
    handleDeletePdf,
    handleSelectPdfSuggestion,
    pdfFileSuggestions,
    handleSave,
    handleCancel,
    isSubmitDisabled
  } = useArchiveCaseModal({ setIsOpen });

  return (
    <>
      <MediaModal
        open={isUploadModalOpen}
        initial={{ tab: 'GALLERY' }}
        mediaKind='pdf'
        onClose={handleCloseUploadFlow}
        onApply={handleApplyPdf}
        hideTabs={false}
        renderers={
          {
            upload: (props) => <UploadView
              {...props}
              accept={PDF_FILE_ACCEPT}
              invalidFileError={ARCHIVE_CASE_MODAL_LABELS.invalidPdfError}
              isAllowedFile={isAllowedPdfFile}
              maxSizeBytes={undefined}
              fileTooLargeError={ARCHIVE_CASE_MODAL_LABELS.maximumSizeError}
            />
          }
        }
      />

      <Dialog disableScrollLock open={isOpen} sx={{ ...styles.dialog }} fullWidth>
        <DialogTitle sx={styles.dialogTitle}>{ARCHIVE_CASE_MODAL_LABELS.title}</DialogTitle>

        <DialogContent sx={styles.dialogContent}>
          <Stack spacing={4} sx={styles.contentContainer}>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
                <TextField label={ARCHIVE_CASE_MODAL_LABELS.description} value={descriptionNumber} onChange={(e) => setDescriptionNumber(e.target.value)} required fullWidth />
                <TextField label={ARCHIVE_CASE_MODAL_LABELS.caseNumber} value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} required fullWidth />
              </Stack>
              <TextField label={ARCHIVE_CASE_MODAL_LABELS.caseName} value={caseName} onChange={(e) => setCaseName(e.target.value)} required fullWidth />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField  sx={styles.shortTextField} label={ARCHIVE_CASE_MODAL_LABELS.sheets} value={sheetsNumber} onChange={(e) => setSheetsNumber(e.target.value)} required />
                <TextField sx={styles.shortTextField} label={ARCHIVE_CASE_MODAL_LABELS.caseDates} value={caseDate} onChange={(e) => setCaseDate(e.target.value)} required />
              </Stack>
              <TextField label={ARCHIVE_CASE_MODAL_LABELS.documentsComposition} value={caseDescriptions} onChange={(e) => setCaseDescriptions(e.target.value)} required fullWidth />
              <Box>
                <LabelActionRow title={ARCHIVE_CASE_MODAL_LABELS.file} action={handleOpenUploadFlow} actionButtonText={ARCHIVE_CASE_MODAL_LABELS.addFile} disabled={!!currentPdfFile.fileName} />

                <Stack spacing={2} sx={styles.sectionStack}>
                  <Stack spacing='10px'>
                    {
                      currentPdfFile.fileName ? (
                        <Box sx={styles.fileItemWrapper}>
                          <FileItem
                            fileName={currentPdfFile.fileName}
                            fileType='pdf'
                            onDelete={handleDeletePdf}
                          />
                        </Box>
                      ) : (
                        <ActionableSuggestItem
                          mode='pdf'
                          suggestions={pdfFileSuggestions}
                          onSelect={handleSelectPdfSuggestion}
                          onUpload={handleOpenUploadFlow}
                          onDelete={handleDeletePdf}
                        />
                      )
                    }
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
          <Button variant='outlined' sx={styles.cancelButton} onClick={handleCancel} disabled={isSubmitDisabled}>
            {ARCHIVE_CASE_MODAL_LABELS.cancel}
          </Button>
          <Button
            variant='contained'
            color='tertiary'
            disableElevation
            sx={styles.saveButton}
            onClick={handleSave}
            disabled={isSubmitDisabled}
          >
            {ARCHIVE_CASE_MODAL_LABELS.save}
          </Button>
        </DialogActions>
      </Dialog>
    </>

  );
};