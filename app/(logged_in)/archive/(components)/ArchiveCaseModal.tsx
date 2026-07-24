'use client';
import React from 'react';

import { ArchiveCaseModalView } from './archive-case-modal-view/ArchiveCaseModalView';
import {
  ARCHIVE_CASE_MODAL_LABELS,
  PDF_FILE_ACCEPT,
} from '~/constants/archive';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import UploadView from '~/shared/components/media-modal/views/upload-view/UploadView';
import { useArchiveCaseModal } from '~/shared/hooks/use-archive-case-modal/useArchiveCaseModal';

interface ArchiveCaseModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  mode?: 'create' | 'edit';
}

export const ArchiveCaseModal = ({ isOpen, setIsOpen, mode = 'create' }: ArchiveCaseModalProps) => {
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
    handleSave,
    handleCancel,
    isSubmitDisabled,
    isCancelDisabled
  } = useArchiveCaseModal({ setIsOpen });

  return (
    <>
      <MediaModal
        open={isUploadModalOpen}
        initial={{ tab: 'GALLERY' }}
        mediaKind="pdf"
        onClose={handleCloseUploadFlow}
        onApply={handleApplyPdf}
        hideTabs={false}
        renderers={{
          upload: (props) => (
            <UploadView
              {...props}
              accept={PDF_FILE_ACCEPT}
              invalidFileError={ARCHIVE_CASE_MODAL_LABELS.invalidPdfError}
              isAllowedFile={isAllowedPdfFile}
              maxSizeBytes={undefined}
              fileTooLargeError={ARCHIVE_CASE_MODAL_LABELS.maximumSizeError}
            />
          )
        }}
      />

      <ArchiveCaseModalView
        isOpen={isOpen}
        onClose={handleCancel}
        mode={mode}
        descriptionNumber={descriptionNumber}
        setDescriptionNumber={setDescriptionNumber}
        caseNumber={caseNumber}
        setCaseNumber={setCaseNumber}
        sheetsNumber={sheetsNumber}
        setSheetsNumber={setSheetsNumber}
        caseDate={caseDate}
        setCaseDate={setCaseDate}
        currentPdfFile={currentPdfFile}
        detailedCaseDescription={detailedCaseDescription}
        setDetailedCaseDescription={setDetailedCaseDescription}
        caseName={caseName}
        setCaseName={setCaseName}
        caseDescriptions={caseDescriptions}
        setCaseDescriptions={setCaseDescriptions}
        handleOpenUploadFlow={handleOpenUploadFlow}
        handleDeletePdf={handleDeletePdf}
        handleSave={handleSave}
        handleCancel={handleCancel}
        isSubmitDisabled={isSubmitDisabled}
        isCancelDisabled={isCancelDisabled}
      />
    </>
  );
};