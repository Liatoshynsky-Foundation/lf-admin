import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  INITIAL_PDF_ENTRY,
  PDF_MIME_TYPE,
  PdfEntry,
} from '~/constants/archive';
import { CASE_VALIDATION_MESSAGES } from '~/constants/case';

export interface ArchiveCaseInitialData {
  descriptionNumber?: string;
  caseNumber?: string;
  sheetsNumber?: string;
  caseDate?: string;
  currentPdfFile?: PdfEntry;
  detailedCaseDescription?: string;
  caseName?: string;
  caseDescriptions?: string;
  pdfUrl?: string;
  pdfMimeType?: string;
  order?: number;
}

export interface ArchiveCaseSaveData {
  descriptionNumber: number;
  caseNumber: number;
  sheetsNumber: number;
  dates: string;
  name: string;
  contentDescription: string;
  nameDescription: string;
  pdfUrl?: string;
  order?: number;
}

export interface UseArchiveCaseModalProps {
  setIsOpen: (isOpen: boolean) => void;
  initialData?: ArchiveCaseInitialData;
  onSave?: (data: ArchiveCaseSaveData) => Promise<void> | void;
}

export const useArchiveCaseModal = ({ setIsOpen, initialData, onSave }: UseArchiveCaseModalProps) => {
  const [descriptionNumber, setDescriptionNumber] = useState(initialData?.descriptionNumber ?? '');
  const [caseNumber, setCaseNumber] = useState(initialData?.caseNumber ?? '');
  const [sheetsNumber, setSheetsNumber] = useState(initialData?.sheetsNumber ?? '');
  const [caseDate, setCaseDate] = useState(initialData?.caseDate ?? '');
  const [currentPdfFile, setCurrentPdfFile] = useState<PdfEntry>(initialData?.currentPdfFile ?? INITIAL_PDF_ENTRY);
  const [detailedCaseDescription, setDetailedCaseDescription] = useState<string>(initialData?.detailedCaseDescription ?? '');
  const [caseName, setCaseName] = useState<string>(initialData?.caseName ?? '');
  const [caseDescriptions, setCaseDescriptions] = useState<string>(initialData?.caseDescriptions ?? '');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setDescriptionNumber(initialData?.descriptionNumber ?? '');
    setCaseNumber(initialData?.caseNumber ?? '');
    setSheetsNumber(initialData?.sheetsNumber ?? '');
    setCaseDate(initialData?.caseDate ?? '');
    setCurrentPdfFile(initialData?.currentPdfFile ?? INITIAL_PDF_ENTRY);
    setDetailedCaseDescription(initialData?.detailedCaseDescription ?? '');
    setCaseName(initialData?.caseName ?? '');
    setCaseDescriptions(initialData?.caseDescriptions ?? '');
  }, [initialData]);

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
    setFieldErrors({});
  };

  const handleCancel = () => {
    clearInputs();
    setIsOpen(false);
  };

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    const validateNumber = (
      value: string,
      required: string,
      invalid: string,
      negative: string,
      notNumber: string
    ) => {
      if (!value.trim()) return required;
      if (/^-\d+$/.test(value.trim())) return negative;
      if (/^[1-9]\d*$/.test(value.trim())) return undefined;
      if (/^0+$/.test(value.trim())) return negative;
      return /[a-zа-яіїєґ]/i.test(value) ? notNumber : invalid;
    };
    const descriptionError = validateNumber(descriptionNumber, CASE_VALIDATION_MESSAGES.descriptionNumberRequired, CASE_VALIDATION_MESSAGES.descriptionNumberInvalid, CASE_VALIDATION_MESSAGES.descriptionNumberNegative, CASE_VALIDATION_MESSAGES.descriptionNumberNotNumber);
    const caseError = validateNumber(caseNumber, CASE_VALIDATION_MESSAGES.caseNumberRequired, CASE_VALIDATION_MESSAGES.caseNumberInvalid, CASE_VALIDATION_MESSAGES.caseNumberNegative, CASE_VALIDATION_MESSAGES.caseNumberNotNumber);
    const sheetsError = validateNumber(sheetsNumber, CASE_VALIDATION_MESSAGES.sheetsNumberRequired, CASE_VALIDATION_MESSAGES.sheetsNumberInvalid, CASE_VALIDATION_MESSAGES.sheetsNumberNegative, CASE_VALIDATION_MESSAGES.sheetsNumberNotNumber);
    if (descriptionError) nextErrors.descriptionNumber = descriptionError;
    if (caseError) nextErrors.caseNumber = caseError;
    if (sheetsError) nextErrors.sheetsNumber = sheetsError;
    if (!caseName.trim()) nextErrors.caseName = CASE_VALIDATION_MESSAGES.caseNameRequired;
    if (!caseDate.trim()) nextErrors.caseDate = CASE_VALIDATION_MESSAGES.caseDateRequired;
    if (!caseDescriptions.trim()) nextErrors.caseDescriptions = CASE_VALIDATION_MESSAGES.caseDescriptionsRequired;
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      await onSave?.({
        descriptionNumber: Number(descriptionNumber),
        caseNumber: Number(caseNumber),
        sheetsNumber: Number(sheetsNumber),
        dates: caseDate,
        name: caseName,
        nameDescription: caseDescriptions,
        contentDescription: detailedCaseDescription,
        ...(initialData?.order !== undefined ? { order: initialData.order } : {}),
        ...(currentPdfFile.url ? { pdfUrl: currentPdfFile.url } : {})
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('таким номером') || message.includes('DUPLICATE_CASE_NUMBERS')) {
        setFieldErrors({
          descriptionNumber: CASE_VALIDATION_MESSAGES.duplicateNumbers,
          caseNumber: CASE_VALIDATION_MESSAGES.duplicateNumbers
        });
      }
      toast.error(message || 'Не вдалося зберегти справу.');
      return;
    }
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
    uploadResult?: { filename?: string; url?: string; mimeType?: string } | null;
  }) => {
    if (!uploadResult) return;
    setCurrentPdfFile((prev) => ({
      ...prev,
      fileName: uploadResult.filename ?? null,
      url: uploadResult.url ?? null,
      mimeType: uploadResult.mimeType ?? null,
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
    fieldErrors,
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
