'use client';

import { Box, Typography } from '@mui/material';
import type { JSONContent } from '@tiptap/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { styles } from './PaymentDetailsPageContent.styles';
import { buildPaymentDetailsInput, getSaveErrorMessage } from './paymentDetailsSave';
import { PaymentHeaderActions } from './PaymentHeaderActions';
import { CurrencyTabs } from './section-blocks/CurrencyTabs';
import { PdfAttachmentBlock } from './section-blocks/PdfAttachmentBlock';
import { RequisitesContentEditor } from './section-blocks/RequisitesContentEditor';
import { PAYMENT_DETAILS_MESSAGES } from '~/constants/paymentDetails';
import {
  type PaymentDetailsPdfFile,
  type PaymentDetailsTab,
  REQUISITES_EMPTY,
  REQUISITES_ERROR,
  REQUISITES_LOADING,
  REQUISITES_MESSAGES
} from '~/constants/requisites';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { ContentPageLayout } from '~/shared/components/content-page-layout/ContentPageLayout';
import { EmptyState } from '~/shared/components/empty-state';
import { normalizePaymentDetails, usePaymentDetails } from '~/shared/hooks/use-payment-details/usePaymentDetails';
import { useUpdatePaymentDetailsMutation } from '~/types/graphql/generated/graphql';

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
  const [updatePaymentDetails, { loading: saving }] = useUpdatePaymentDetailsMutation();
  const localBlobUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!data) return;

    setTabs(data.tabs);
    setPdfFile(data.pdfFile ?? null);
    setSavedTabIds(new Set(data.tabs.map((tab) => tab.id)));
    setActiveTabId((currentId) => resolveActiveTabId(data.tabs, currentId));
  }, [data]);

  const revokeBlobUrl = (url?: string | null) => {
    if (url && localBlobUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      localBlobUrlsRef.current.delete(url);
    }
  };

  useEffect(() => {
    const urls = localBlobUrlsRef.current;
    return () => {
      urls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      urls.clear();
    };
  }, []);

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

  const handlePdfChange = (file: PaymentDetailsPdfFile | null) => {
    if (file?.url?.startsWith('blob:')) {
      localBlobUrlsRef.current.add(file.url);
    }

    if (pdfFile?.url && pdfFile.url !== file?.url) {
      revokeBlobUrl(pdfFile.url);
    }
    setPdfFile(file);
  };

  const handleSave = async () => {
    const activeTabIndex = Math.max(
      tabs.findIndex((tab) => tab.id === activeTabId),
      0
    );

    try {
      const { data: response } = await updatePaymentDetails({
        variables: { input: buildPaymentDetailsInput(tabs, savedTabIds, pdfFile) }
      });
      const saved = normalizePaymentDetails(
        response ? { paymentDetails: response.updatePaymentDetails } : undefined
      );

      if (saved) {
        setTabs(saved.tabs);
        setPdfFile(saved.pdfFile ?? null);
        setSavedTabIds(new Set(saved.tabs.map((tab) => tab.id)));
        setActiveTabId(saved.tabs[activeTabIndex]?.id ?? saved.tabs[0]?.id ?? '');
        setEditingTabId(null);
      }

      toast.success(REQUISITES_MESSAGES.SAVE_SUCCESS);
    } catch (saveError) {
      toast.error(getSaveErrorMessage(saveError));
    }
  };

  return (
    <ContentPageLayout
      title={<Typography variant="h4">{REQUISITES_MESSAGES.PAGE_TITLE}</Typography>}
      showBackButton={false}
      rightActions={<PaymentHeaderActions onSave={() => void handleSave()} saving={saving} />}
    >
      <CollapsibleBlock title={REQUISITES_MESSAGES.BLOCK_TITLE} defaultExpanded>
        <Box sx={styles.content}>
          <CurrencyTabs
            items={tabs}
            activeId={activeTabId}
            editingId={editingTabId}
            onSelectTab={handleSelectTab}
            onAddTab={handleAddTab}
            onUpdateCurrency={handleUpdateTabName}
            setEditingId={setEditingTabId}
          />

          <RequisitesContentEditor
            key={activeTab.id}
            value={activeTab.content}
            onChange={handleContentChange}
          />

          <PdfAttachmentBlock
            file={pdfFile}
            onFileChange={handlePdfChange}
            disabled
          />
        </Box>
      </CollapsibleBlock>
    </ContentPageLayout>
  );
};

export default PaymentDetailsPageContent;
