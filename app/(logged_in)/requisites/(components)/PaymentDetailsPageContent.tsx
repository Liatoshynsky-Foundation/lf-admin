'use client';

import { Box, Typography } from '@mui/material';
import type { JSONContent } from '@tiptap/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { INITIAL_REQUISITES_DATA } from '../__mocks__/requisites';
import { styles } from './PaymentDetailsPageContent.styles';
import { PaymentHeaderActions } from './PaymentHeaderActions';
import { CurrencyTabs } from './section-blocks/CurrencyTabs';
import { PdfAttachmentBlock } from './section-blocks/PdfAttachmentBlock';
import { RequisitesContentEditor } from './section-blocks/RequisitesContentEditor';
import {
  type PaymentDetailsPdfFile,
  type PaymentDetailsTab,
  REQUISITES_MESSAGES
} from '~/constants/requisites';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { ContentPageLayout } from '~/shared/components/content-page-layout/ContentPageLayout';

const PaymentDetailsPageContent = () => {
  const [tabs, setTabs] = useState<PaymentDetailsTab[]>(INITIAL_REQUISITES_DATA.items);
  const [activeTabId, setActiveTabId] = useState(INITIAL_REQUISITES_DATA.items[0].id);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const localBlobUrlsRef = useRef<Set<string>>(new Set());

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
      pdfFile: null,
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
      const deletedTab = prev.find((tab) => tab.id === id);
      if (deletedTab?.pdfFile?.url) {
        revokeBlobUrl(deletedTab.pdfFile.url);
      }
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

    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === activeTabId) {
          if (tab.pdfFile?.url && tab.pdfFile.url !== file?.url) {
            revokeBlobUrl(tab.pdfFile.url);
          }
          return { ...tab, pdfFile: file };
        }
        return tab;
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success(REQUISITES_MESSAGES.SAVE_SUCCESS);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentPageLayout
      title={<Typography variant="h4">{REQUISITES_MESSAGES.PAGE_TITLE}</Typography>}
      showBackButton={false}
      rightActions={
        <PaymentHeaderActions onSave={() => void handleSave()} saving={saving} />
      }
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
          />

          <RequisitesContentEditor
            key={activeTab.id}
            value={activeTab.content}
            onChange={handleContentChange}
          />

          <PdfAttachmentBlock
            file={activeTab.pdfFile ?? null}
            onFileChange={handlePdfChange}
            disabled={saving}
          />
        </Box>
      </CollapsibleBlock>
    </ContentPageLayout>
  );
};

export default PaymentDetailsPageContent;
