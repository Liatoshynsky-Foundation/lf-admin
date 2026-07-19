import { JSONContent } from '@tiptap/react';
import { useMemo, useState } from 'react';

import { useAllAssets } from '../use-assets/useAssets';
import {
  INITIAL_DETAILED_CASE_DESCRIPTION,
  INITIAL_PDF_ENTRY,
  PDF_MIME_TYPE,
  PdfEntry,
} from '~/constants/archive';
import { AssetType } from '~/types/graphql/generated/graphql';

export interface UseArchiveCaseModalProps {
  setIsOpen: (isOpen: boolean) => void;
}

export const useArchiveCaseModal = ({ setIsOpen }: UseArchiveCaseModalProps) => {
  const { data } = useAllAssets({ type: AssetType.Pdf });

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

  const isDirty = descriptionNumber.trim() || caseNumber.trim() || sheetsNumber.trim() || caseDate.trim() || currentPdfFile.fileName ||currentPdfFile.name || detailedCaseDescription || caseName.trim() || caseDescriptions.trim();
  
  const clearInputs = () => {
    setDescriptionNumber('');
    setCaseNumber('');
    setSheetsNumber('');
    setCaseDate('');
    setCurrentPdfFile(INITIAL_PDF_ENTRY);
    setDetailedCaseDescription(INITIAL_DETAILED_CASE_DESCRIPTION);
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

  const handleSelectPdfSuggestion = (val: string | null) => {
    setCurrentPdfFile((prev) => ({ ...prev, name: val }));
  };

  const pdfFileSuggestions = useMemo(() => {
    const pdfFiles = new Set<string>();

    data?.allAssets?.forEach((asset) => {
      pdfFiles.add(asset.filename);
    });

    return Array.from(pdfFiles);
  }, [data?.allAssets]);

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
    pdfFileSuggestions,
    isSubmitDisabled: !isDirty,
    handleSubmit,
    handleSave,
    handleCancel,
    clearInputs,
  };
};
