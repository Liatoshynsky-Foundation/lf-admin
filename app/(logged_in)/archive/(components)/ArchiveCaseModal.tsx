'use client';

import toast from 'react-hot-toast';

import { ArchiveCaseModalView } from './archive-case-modal-view/ArchiveCaseModalView';
import {
  ARCHIVE_CASE_MODAL_LABELS,
  PDF_FILE_ACCEPT,
} from '~/constants/archive';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalResult, UploadResult } from '~/shared/components/media-modal/MediaModal.types';
import UploadView from '~/shared/components/media-modal/views/upload-view/UploadView';
import {
  ArchiveCaseInitialData,
  ArchiveCaseSaveData,
  useArchiveCaseModal
} from '~/shared/hooks/use-archive-case-modal/useArchiveCaseModal';
import { useCreateCase, useUpdateCase } from '~/shared/hooks/use-funds/useFunds';
import {
  AssetType,
  CaseStatus,
  useCreateAssetMutation
} from '~/types/graphql/generated/graphql';

interface ArchiveCaseModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  mode?: 'create' | 'edit';
  initialData?: ArchiveCaseInitialData;
  fundId?: string;
  caseId?: string;
  onSaved?: () => void;
}

export const ArchiveCaseModal = ({ isOpen, setIsOpen, mode = 'create', initialData, fundId, caseId, onSaved }: ArchiveCaseModalProps) => {
  const [createCase] = useCreateCase();
  const [updateCase] = useUpdateCase();
  const [createAsset] = useCreateAssetMutation();
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
    handleApplyPdf: applyPdfToForm,
    handleDeletePdf,
    handleSave,
    handleCancel,
    isSubmitDisabled,
    isCancelDisabled,
    fieldErrors
  } = useArchiveCaseModal({
    setIsOpen,
    ...(initialData ? { initialData } : {}),
    ...((fundId || caseId) ? { onSave: async (input: ArchiveCaseSaveData) => {
      const mutationInput = {
        fundId: fundId ?? '',
        descriptionNumber: input.descriptionNumber,
        caseNumber: input.caseNumber,
        caseName: { uk: input.name, en: input.name },
        caseDate: { uk: input.dates, en: input.dates },
        sheetsNumber: input.sheetsNumber,
        caseDescriptions: { uk: input.nameDescription, en: input.nameDescription },
        detailedCaseDescription: input.contentDescription
          ? { uk: input.contentDescription, en: input.contentDescription }
          : undefined,
        ...(input.pdfUrl
          ? {
            pdfFile: {
              filename: input.pdfUrl.split('/').pop() ?? 'document.pdf',
              url: input.pdfUrl,
              mimeType: 'application/pdf'
            }
          }
          : {})
      };

      if (caseId) {
        const { fundId: _fundId, ...caseInput } = mutationInput;
        await updateCase({ id: caseId, input: caseInput });
      } else {
        await createCase({ ...mutationInput, status: CaseStatus.Draft });
      }
      toast.success(caseId ? 'Справу успішно змінено' : 'Справу успішно додано');
      onSaved?.();
    } } : {})
  });

  const handleApplyPdf = async (result: MediaModalResult) => {
    if (result.selected.kind === 'upload' && result.uploadResult) {
      const { url, filename, originalName, mimeType, size } = result.uploadResult as UploadResult;

      try {
        const response = await createAsset({
          variables: {
            input: {
              filename: originalName || filename,
              url,
              mimeType,
              sizeBytes: size,
              type: AssetType.Pdf
            }
          }
        });

        const asset = response.data?.createAsset;
        if (!asset) throw new Error('Не вдалося завантажити PDF файл');

        applyPdfToForm({ uploadResult: asset });
        toast.success('Файл успішно завантажено');
        handleCloseUploadFlow();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити файл.');
      }
      return;
    }

    if (result.selected.kind === 'gallery' || result.selected.kind === 'used') {
      applyPdfToForm({
        uploadResult: {
          filename: result.selected.fileName,
          url: result.selected.src,
          mimeType: 'application/pdf'
        }
      });
      handleCloseUploadFlow();
    }
  };

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
        fieldErrors={fieldErrors}
      />
    </>
  );
};