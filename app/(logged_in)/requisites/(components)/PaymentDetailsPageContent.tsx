'use client';

import { Box, Typography } from '@mui/material';
import type { JSONContent } from '@tiptap/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { styles } from './PaymentDetailsPageContent.styles';
// import { PaymentHeaderActions } from './PaymentHeaderActions';
import { CurrencyTabs } from './section-blocks/CurrencyTabs';
import { PdfAttachmentBlock } from './section-blocks/PdfAttachmentBlock';
import { RequisitesContentEditor } from './section-blocks/RequisitesContentEditor';
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
import { usePaymentDetails } from '~/shared/hooks/use-payment-details/usePaymentDetails';

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
  // const [saving, setSaving] = useState(false);
  const localBlobUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!data) return;

    setTabs(data.tabs);
    setPdfFile(data.pdfFile ?? null);
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

  const handleUpdateTabName = (id: string, newName: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, name: newName } : tab))
    );
  };

  const handleDeleteTab = (id: string) => {
    if (tabs.length <= 1) {
      toast.error('Неможливо видалити останню вкладку');
      return;
    }

    setTabs((prev) => {
      const filtered = prev.filter((tab) => tab.id !== id);
      if (activeTabId === id) {
        setActiveTabId(filtered[0].id);
      }
      return filtered;
    });
    setEditingTabId(null);
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

  // const handleSave = async () => {
  //   setSaving(true);
  //   try {
  //     await new Promise((resolve) => setTimeout(resolve, 600));
  //     toast.success(REQUISITES_MESSAGES.SAVE_SUCCESS);
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  // rightActions={
  //   <PaymentHeaderActions onSave={() => void handleSave()} saving={saving} />
  // }

  return (
    <ContentPageLayout
      title={<Typography variant="h4">{REQUISITES_MESSAGES.PAGE_TITLE}</Typography>}
      showBackButton={false}
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
            onDeleteTab={handleDeleteTab}
            setEditingId={setEditingTabId}
            readOnly
          />

          <RequisitesContentEditor
            key={activeTab.id}
            value={activeTab.content}
            onChange={handleContentChange}
            readOnly
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
