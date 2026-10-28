'use client';

import { Box, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { INITIAL_REQUISITES_DATA } from '../__mocks__/requisites';
import { styles } from './PaymentDetailsPageContent.styles';
import { PaymentHeaderActions } from './PaymentHeaderActions';
import { CurrencyTabs } from './section-blocks/CurrencyTabs';
import { PdfAttachmentBlock } from './section-blocks/PdfAttachmentBlock';
import { RequisitesContentEditor } from './section-blocks/RequisitesContentEditor';
import {
  type RequisiteItem,
  type RequisitePdfFile,
  REQUISITES_MESSAGES
} from '~/constants/requisites';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { ContentPageLayout } from '~/shared/components/content-page-layout/ContentPageLayout';

const PaymentDetailsPageContent = () => {
  const [items, setItems] = useState<RequisiteItem[]>(INITIAL_REQUISITES_DATA.items);
  const [activeTabId, setActiveTabId] = useState(
    INITIAL_REQUISITES_DATA.items[0]?.id ?? ''
  );
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const activeItem = useMemo(() => {
    return items.find((item) => item.id === activeTabId) ?? items[0];
  }, [items, activeTabId]);

  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
    setEditingTabId((prev) => (prev === id ? prev : null));
  };

  const handleAddTab = () => {
    const newId = `req-${Date.now()}`;
    const newItem: RequisiteItem = {
      id: newId,
      currency: REQUISITES_MESSAGES.DEFAULT_NEW_CURRENCY,
      content: '',
      pdfFile: null,
      order: items.length
    };
    setItems((prev) => [...prev, newItem]);
    setActiveTabId(newId);
    setEditingTabId(newId);
  };

  const handleUpdateCurrency = (id: string, newCurrency: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, currency: newCurrency } : item))
    );
  };

  const handleDeleteTab = (id: string) => {
    if (items.length <= 1) {
      toast.error('Неможливо видалити останню вкладку');
      return;
    }

    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (activeTabId === id) {
        setActiveTabId(filtered[0]?.id ?? '');
      }
      return filtered;
    });
    setEditingTabId(null);
  };

  const handleContentChange = (newContent: string) => {
    if (!activeItem) return;
    setItems((prev) =>
      prev.map((item) => (item.id === activeItem.id ? { ...item, content: newContent } : item))
    );
  };

  const handlePdfChange = (file: RequisitePdfFile | null) => {
    if (!activeItem) return;
    setItems((prev) =>
      prev.map((item) => (item.id === activeItem.id ? { ...item, pdfFile: file } : item))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success(REQUISITES_MESSAGES.SAVE_SUCCESS);
    } catch {
      toast.error('Помилка під час збереження');
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
            items={items}
            activeId={activeItem ? activeItem.id : ''}
            editingId={editingTabId}
            onSelectTab={handleSelectTab}
            onAddTab={handleAddTab}
            onUpdateCurrency={handleUpdateCurrency}
            onDeleteTab={handleDeleteTab}
            setEditingId={setEditingTabId}
          />

          {activeItem && (
            <>
              <RequisitesContentEditor
                value={activeItem.content}
                onChange={handleContentChange}
                disabled={saving}
              />

              <PdfAttachmentBlock
                file={activeItem.pdfFile}
                onFileChange={handlePdfChange}
                disabled={saving}
              />
            </>
          )}
        </Box>
      </CollapsibleBlock>
    </ContentPageLayout>
  );
};

export default PaymentDetailsPageContent;
