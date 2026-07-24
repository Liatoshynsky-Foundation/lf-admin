import { useState } from 'react';

import {
  INITIAL_PDF_ENTRY,
  PDF_MIME_TYPE,
  PdfEntry,
} from '~/constants/archive';

export interface ArchiveCaseInitialData {
  descriptionNumber?: string;
  caseNumber?: string;
  sheetsNumber?: string;
  caseDate?: string;
  currentPdfFile?: PdfEntry;
  detailedCaseDescription?: string;
  caseName?: string;
  caseDescriptions?: string;
}

export interface UseArchiveCaseModalProps {
  setIsOpen: (isOpen: boolean) => void;
  initialData?: ArchiveCaseInitialData;
}

export const useArchiveCaseModal = ({ setIsOpen, initialData }: UseArchiveCaseModalProps) => {
  const [descriptionNumber, setDescriptionNumber] = useState(initialData?.descriptionNumber ?? '');
  const [caseNumber, setCaseNumber] = useState(initialData?.caseNumber ?? '');
  const [sheetsNumber, setSheetsNumber] = useState(initialData?.sheetsNumber ?? '');
  const [caseDate, setCaseDate] = useState(initialData?.caseDate ?? '');
  const [currentPdfFile, setCurrentPdfFile] = useState<PdfEntry>(initialData?.currentPdfFile ?? INITIAL_PDF_ENTRY);
  const [detailedCaseDescription, setDetailedCaseDescription] = useState<string>(initialData?.detailedCaseDescription ?? '');
  const [caseName, setCaseName] = useState<string>(initialData?.caseName ?? '');
  const [caseDescriptions, setCaseDescriptions] = useState<string>(initialData?.caseDescriptions ?? '');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const isDirty = Boolean(descriptionNumber.trim() || caseNumber.trim() || sheetsNumber.trim() || caseDate.trim() || currentPdfFile.fileName || detailedCaseDescription.trim() || caseName.trim() || caseDescriptions.trim());
  
  const isFormValid = Boolean(descriptionNumber.trim() && caseNumber.trim() && caseName.trim() && sheetsNumber.trim() && caseDate.trim() && caseDescriptions.trim());

  const clearInputs = () => {
    setDescriptionNumber('');
    setCaseNumber('');
    setSheetsNumber('');
    setCaseDate('');
    setCurrentPdfFile(INITIAL_PDF_ENTRY);
    setDetailedCaseDescription('');
    setCaseName('');
    setCaseDescriptions('');
  };

  const handleCancel = () => {
    clearInputs();
    setIsOpen(false);
  };

  const handleSave = () => {
    clearInputs();
    setIsOpen(false);
  };

  const handleSubmit = handleSave;

  const handleOpenUploadFlow = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadFlow = () => {
    setIsUploadModalOpen(false);
  };

  const isAllowedPdfFile = (file: File): boolean => {
    const mimeType = file.type.toLowerCase();
    const extension = file.name.split('.').pop();

    return mimeType === PDF_MIME_TYPE || extension === 'pdf';
  };

  const handleApplyPdf = ({
    uploadResult,
  }: {
    uploadResult?: { filename?: string } | null;
  }) => {
    if (!uploadResult) return;
    setCurrentPdfFile((prev) => ({
      ...prev,
      fileName: uploadResult.filename ?? null,
    }));
  };

  const handleDeletePdf = () => {
    setCurrentPdfFile(INITIAL_PDF_ENTRY);
  };

  return {
    descriptionNumber,
    setDescriptionNumber,
    caseNumber,
    setCaseNumber,
    sheetsNumber,
    setSheetsNumber,
    caseDate,
    setCaseDate,
    currentPdfFile,
    setCurrentPdfFile,
    detailedCaseDescription,
    setDetailedCaseDescription,
    caseName,
    setCaseName,
    caseDescriptions,
    setCaseDescriptions,
    isUploadModalOpen,
    setIsUploadModalOpen,
    handleOpenUploadFlow,
    handleCloseUploadFlow,
    isAllowedPdfFile,
    handleApplyPdf,
    handleDeletePdf,
    isSubmitDisabled: !isFormValid,
    isCancelDisabled: !isDirty,
    handleSubmit,
    handleSave,
    handleCancel,
    clearInputs,
  };
};
