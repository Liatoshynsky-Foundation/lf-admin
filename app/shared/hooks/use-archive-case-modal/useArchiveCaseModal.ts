import { JSONContent } from '@tiptap/react';
import { useState } from 'react';

import {
  INITIAL_DETAILED_CASE_DESCRIPTION,
  INITIAL_PDF_ENTRY,
  PDF_MIME_TYPE,
  PdfEntry,
} from '~/constants/archive';

export const useArchiveCaseModal = () => {
  const [descriptionNumber, setDescriptionNumber] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [sheetsNumber, setSheetsNumber] = useState('');
  const [caseDate, setCaseDate] = useState('');
  const [currentPdfFile, setCurrentPdfFile] = useState<PdfEntry>(INITIAL_PDF_ENTRY);
  const [detailedCaseDescription, setDetailedCaseDescription] =
    useState<JSONContent>(INITIAL_DETAILED_CASE_DESCRIPTION);
  const [caseName, setCaseName] = useState<string>('');
  const [caseDescriptions, setCaseDescriptions] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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

  const handleSelectPdfSuggestion = (val: string | null) => {
    setCurrentPdfFile((prev) => ({ ...prev, name: val }));
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
    handleSelectPdfSuggestion,
  };
};
