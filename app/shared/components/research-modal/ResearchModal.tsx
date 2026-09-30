'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { ResearchModalView, ResearchWorkFormData } from './research-modal-view/ResearchModalView';
import { PDF_FILE_ACCEPT } from '~/constants/archive';
import { RESEARCH_MUTATION_RESULTS, RESEARCH_VALIDATION_MESSAGES } from '~/constants/research';
import { resolveErrorMessage } from '~/lib/utils/resolveErrorMessage';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';
import { isPdfUploadFile } from '~/shared/components/media-modal/MediaModal.utils';
import { resolvePdfAttachmentFromMediaModal } from '~/shared/components/media-modal/resolvePdfAttachmentFromMediaModal';
import UploadView from '~/shared/components/media-modal/views/upload-view/UploadView';
import {
  useCreateResearchWork,
  useResearchWorkAuthors,
  useUpdateResearchWork
} from '~/shared/hooks/use-research-works/useResearchWorks';
import {
  type CreateResearchWorkInput,
  type ResearchWorkPdfFileInput,
  ResearchWorkStatus,
  type UpdateResearchWorkInput,
  useCreateAssetMutation
} from '~/types/graphql/generated/graphql';
import type { ResearchWorkPdfFile } from '~/types/researchWork';

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  workId?: string;
  existingPdfFile?: ResearchWorkPdfFile;
  initialData?: Partial<ResearchWorkFormData>;
}

const toStatus = (isVisibleOnSite: boolean): ResearchWorkStatus =>
  isVisibleOnSite ? ResearchWorkStatus.Published : ResearchWorkStatus.Hidden;

const toCommonInput = (data: ResearchWorkFormData) => ({
  bibliographicDescription: data.bibliographicDescription.trim(),
  author: data.author.trim(),
  year: data.caseDates.trim(),
  keywords: data.keywords.trim() || null,
  url: data.url.trim() || null,
  status: toStatus(data.isVisibleOnSite)
});

const ResearchModal = ({
  isOpen,
  onClose,
  mode = 'create',
  workId,
  existingPdfFile,
  initialData
}: ResearchModalProps) => {
  const [createResearchWork] = useCreateResearchWork();
  const [updateResearchWork] = useUpdateResearchWork();
  const [createAsset] = useCreateAssetMutation();
  const { authors: authorOptions } = useResearchWorkAuthors({ skip: !isOpen });
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [attachedPdf, setAttachedPdf] = useState<ResearchWorkPdfFile | null>(existingPdfFile ?? null);

  useEffect(() => {
    if (isOpen) {
      setAttachedPdf(existingPdfFile ?? null);
    }
  }, [existingPdfFile, isOpen]);

  const resolvePdfFile = (): ResearchWorkPdfFileInput | null | undefined => {
    if (attachedPdf) {
      const isUnchangedExistingPdf =
        mode === 'edit' &&
        attachedPdf.url === existingPdfFile?.url &&
        attachedPdf.filename === existingPdfFile?.filename;

      if (isUnchangedExistingPdf) {
        return undefined;
      }

      return attachedPdf;
    }

    if (mode === 'edit' && existingPdfFile) {
      return null;
    }

    return undefined;
  };

  const saveCreate = async (data: ResearchWorkFormData, pdfFile: ResearchWorkPdfFileInput | null | undefined) => {
    const input: CreateResearchWorkInput = {
      ...toCommonInput(data),
      ...(pdfFile ? { pdfFile } : {})
    };

    await createResearchWork(input);
    toast.success(RESEARCH_MUTATION_RESULTS.created);
  };

  const saveUpdate = async (
    data: ResearchWorkFormData,
    pdfFile: ResearchWorkPdfFileInput | null | undefined
  ) => {
    if (!workId) {
      throw new Error(RESEARCH_MUTATION_RESULTS.updateFailed);
    }

    const input: UpdateResearchWorkInput = {
      ...toCommonInput(data),
      ...(pdfFile !== undefined ? { pdfFile } : {})
    };

    await updateResearchWork(workId, input);
    toast.success(RESEARCH_MUTATION_RESULTS.updated);
  };

  const handleSave = async (data: ResearchWorkFormData) => {
    try {
      const pdfFile = resolvePdfFile();

      if (mode === 'edit') {
        await saveUpdate(data, pdfFile);
      } else {
        await saveCreate(data, pdfFile);
      }

      onClose();
    } catch (error) {
      const fallback =
        mode === 'edit' ? RESEARCH_MUTATION_RESULTS.updateFailed : RESEARCH_MUTATION_RESULTS.createFailed;
      toast.error(resolveErrorMessage(error, fallback));
      throw error;
    }
  };

  const handleApplyPdf = async (result: MediaModalResult) => {
    try {
      const resolved = await resolvePdfAttachmentFromMediaModal(
        result,
        createAsset,
        RESEARCH_MUTATION_RESULTS.uploadFailed
      );

      if (!resolved) {
        return;
      }

      setAttachedPdf(resolved.pdf);
      setIsMediaOpen(false);
    } catch (error) {
      toast.error(resolveErrorMessage(error, RESEARCH_MUTATION_RESULTS.uploadFailed));
    }
  };

  return (
    <>
      <MediaModal
        open={isMediaOpen}
        initial={{ tab: 'GALLERY' }}
        mediaKind="pdf"
        onClose={() => setIsMediaOpen(false)}
        onApply={handleApplyPdf}
        renderers={{
          upload: (props) => (
            <UploadView
              {...props}
              accept={PDF_FILE_ACCEPT}
              invalidFileError={RESEARCH_VALIDATION_MESSAGES.pdfInvalidType}
              isAllowedFile={isPdfUploadFile}
            />
          )
        }}
      />

      <ResearchModalView
        isOpen={isOpen}
        initialData={initialData}
        authorOptions={authorOptions}
        attachedFileName={attachedPdf?.filename ?? null}
        onAddFile={() => setIsMediaOpen(true)}
        onDeleteFile={() => setAttachedPdf(null)}
        onClose={onClose}
        onSave={handleSave}
      />
    </>
  );
};

export default ResearchModal;
