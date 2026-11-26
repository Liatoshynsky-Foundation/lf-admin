'use client';

import { Box, Typography } from '@mui/material';
import type { JSONContent } from '@tiptap/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { styles } from './PaymentDetailsPageContent.styles';
import { isPaymentDetailsPdfFile, toPaymentDetailsPdfFile } from './paymentDetailsPdf';
import { buildPaymentDetailsInput, getSaveErrorMessage } from './paymentDetailsSave';
import { PaymentHeaderActions } from './PaymentHeaderActions';
import { CurrencyTabs } from './section-blocks/CurrencyTabs';
import { PdfAttachmentBlock } from './section-blocks/PdfAttachmentBlock';
import { RequisitesContentEditor } from './section-blocks/RequisitesContentEditor';
import { PDF_FILE_ACCEPT } from '~/constants/archive';
import { PAYMENT_DETAILS_MESSAGES } from '~/constants/paymentDetails';
import {
  PAYMENT_DETAILS_PDF_MAX_SIZE_BYTES,
  type PaymentDetailsPdfFile,
  type PaymentDetailsTab,
  REQUISITES_EMPTY,
  REQUISITES_ERROR,
  REQUISITES_LOADING,
  REQUISITES_MESSAGES
} from '~/constants/requisites';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { resolveErrorMessage } from '~/lib/utils/resolveErrorMessage';
import { ContentPageLayout } from '~/shared/components/content-page-layout/ContentPageLayout';
import { EmptyState } from '~/shared/components/empty-state';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';
import { resolvePdfAttachmentFromMediaModal } from '~/shared/components/media-modal/resolvePdfAttachmentFromMediaModal';
import UploadView from '~/shared/components/media-modal/views/upload-view/UploadView';
import { normalizePaymentDetails, usePaymentDetails } from '~/shared/hooks/use-payment-details/usePaymentDetails';
import { useCreateAssetMutation, useUpdatePaymentDetailsMutation } from '~/types/graphql/generated/graphql';

const resolveActiveTabId = (
  tabs: PaymentDetailsTab[],
  currentId: string
): string => {
  const currentTabStillExists = tabs.some((tab) => tab.id === currentId);

  if (currentTabStillExists) return currentId;

  return tabs[0]?.id ?? '';
};

const PaymentDetailsPageContent = () => {
  const { data, loading, error } = usePaymentDetails();
  const [tabs, setTabs] = useState<PaymentDetailsTab[]>([]);
  const [pdfFile, setPdfFile] = useState<PaymentDetailsPdfFile | null>(null);
  const [activeTabId, setActiveTabId] = useState('');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [savedTabIds, setSavedTabIds] = useState<ReadonlySet<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [updatePaymentDetails] = useUpdatePaymentDetailsMutation();
  const [createAsset] = useCreateAssetMutation();
  const pdfApplyRequestIdRef = useRef(0);

  useEffect(() => {
    if (!data) return;

    setTabs(data.tabs);
    setPdfFile(data.pdfFile ?? null);
    setSavedTabIds(new Set(data.tabs.map((tab) => tab.id)));
    setActiveTabId((currentId) => resolveActiveTabId(data.tabs, currentId));
  }, [data]);

  const activeTab = useMemo(() => {
    return tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  }, [tabs, activeTabId]);

  if (loading) {
    return <EmptyState title={REQUISITES_LOADING.title} description={REQUISITES_LOADING.description} />;
  }

  if (error) {
    return <EmptyState title={REQUISITES_ERROR.title} description={REQUISITES_ERROR.description} />;
  }

  if (!data || !activeTab) {
    return <EmptyState title={REQUISITES_EMPTY.title} description={REQUISITES_EMPTY.description} />;
  }

  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
    setEditingTabId(null);
  };

  const handleDeleteTab = (id: string) => {
    if (tabs.length <= 1) return;

    setTabs((previousTabs) => {
      const deletedIndex = previousTabs.findIndex((tab) => tab.id === id);

      if (deletedIndex === -1) return previousTabs;

      const remainingTabs = previousTabs.filter((tab) => tab.id !== id);

      if (activeTabId === id) {
        const fallbackTab =
          remainingTabs[deletedIndex] ?? remainingTabs[deletedIndex - 1];

        setActiveTabId(fallbackTab?.id ?? '');
      }

      setEditingTabId((editingId) => (editingId === id ? null : editingId));

      return remainingTabs;
    });
  };

  const handleAddTab = () => {
    const newId = `req-${Date.now()}`;
    const newTab: PaymentDetailsTab = {
      id: newId,
      name: REQUISITES_MESSAGES.DEFAULT_NEW_CURRENCY,
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      order: tabs.length
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setEditingTabId(newId);
  };

  const handleUpdateTabName = (id: string, newName: string): boolean => {
    const trimmedName = newName.trim();

    if (!trimmedName || trimmedName.length > 40) {
      return false;
    }

    const isDuplicate = tabs.some(
      (tab) =>
        tab.id !== id &&
      tab.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      toast.error(PAYMENT_DETAILS_MESSAGES.tabNameDuplicate);
      return false;
    }

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === id ? { ...tab, name: trimmedName } : tab
      )
    );

    return true;
  };

  const handleContentChange = (newContent: JSONContent) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === activeTabId ? { ...tab, content: newContent } : tab))
    );
  };

  const handleCloseMediaModal = () => {
    pdfApplyRequestIdRef.current += 1;
    setIsMediaOpen(false);
  };

  const handleApplyPdf = async (result: MediaModalResult) => {
    const requestId = ++pdfApplyRequestIdRef.current;

    try {
      const resolved = await resolvePdfAttachmentFromMediaModal(
        result,
        createAsset,
        REQUISITES_MESSAGES.PDF_UPLOAD_FAILED
      );

      if (!resolved || pdfApplyRequestIdRef.current !== requestId) {
        return;
      }

      setPdfFile(toPaymentDetailsPdfFile(resolved));
      setIsMediaOpen(false);
    } catch (pdfError) {
      if (pdfApplyRequestIdRef.current !== requestId) {
        return;
      }

      toast.error(resolveErrorMessage(pdfError, REQUISITES_MESSAGES.PDF_UPLOAD_FAILED));
    }
  };

  const handleSave = async () => {
    const activeTabIndex = Math.max(
      tabs.findIndex((tab) => tab.id === activeTabId),
      0
    );

    setIsSaving(true);

    try {
      const { data: response } = await updatePaymentDetails({
        variables: { input: buildPaymentDetailsInput(tabs, savedTabIds, pdfFile) }
      });
      const saved = normalizePaymentDetails(
        response ? { paymentDetails: response.updatePaymentDetails } : undefined
      );

      if (!saved) {
        toast.error(REQUISITES_MESSAGES.SAVE_ERROR);
        return;
      }

      setTabs(saved.tabs);
      setPdfFile(saved.pdfFile ?? null);
      setSavedTabIds(new Set(saved.tabs.map((tab) => tab.id)));
      setActiveTabId(saved.tabs[activeTabIndex]?.id ?? saved.tabs[0]?.id ?? '');
      setEditingTabId(null);
      toast.success(REQUISITES_MESSAGES.SAVE_SUCCESS);
    } catch (saveError) {
      toast.error(getSaveErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ContentPageLayout
      title={<Typography variant="h4">{REQUISITES_MESSAGES.PAGE_TITLE}</Typography>}
      showBackButton={false}
      rightActions={<PaymentHeaderActions onSave={() => void handleSave()} saving={isSaving} />}
    >
      <CollapsibleBlock title={REQUISITES_MESSAGES.BLOCK_TITLE} defaultExpanded>
        <Box sx={styles.content}>
          <CurrencyTabs
            items={tabs}
            activeId={activeTabId}
            editingId={editingTabId}
            onSelectTab={handleSelectTab}
            onAddTab={handleAddTab}
            onReorder={setTabs}
            onUpdateCurrency={handleUpdateTabName}
            onDeleteTab={handleDeleteTab}
            setEditingId={setEditingTabId}
            readOnly={isSaving}
          />

          <RequisitesContentEditor
            key={activeTab.id}
            value={activeTab.content}
            onChange={handleContentChange}
            readOnly={isSaving}
          />

          <PdfAttachmentBlock
            file={pdfFile}
            onAddFile={() => setIsMediaOpen(true)}
            disabled={isSaving}
          />
        </Box>
      </CollapsibleBlock>

      <MediaModal
        open={isMediaOpen}
        initial={{ tab: 'GALLERY' }}
        mediaKind="pdf"
        persistUploadAsAsset={false}
        onClose={handleCloseMediaModal}
        onApply={handleApplyPdf}
        renderers={{
          upload: (props) => (
            <UploadView
              {...props}
              accept={PDF_FILE_ACCEPT}
              invalidFileError={PAYMENT_DETAILS_MESSAGES.pdfInvalidType}
              isAllowedFile={isPaymentDetailsPdfFile}
              maxSizeBytes={PAYMENT_DETAILS_PDF_MAX_SIZE_BYTES}
              fileTooLargeError={PAYMENT_DETAILS_MESSAGES.pdfFileMaxSize}
            />
          )
        }}
      />
    </ContentPageLayout>
  );
};

export default PaymentDetailsPageContent;
