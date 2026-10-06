'use client';

import { DragEndEvent } from '@dnd-kit/core';
import { Box, IconButton } from '@mui/material';
import { Plus } from 'lucide-react';

import { type PageSection, type SectionItemType } from './pageSection.types';
import { createSectionItem, SECTION_ITEM_LABEL, sectionOrdinalTitle } from './pageSection.utils';
import { styles } from './PageSectionsEditor.styles';
import { PAGE_SECTION_ADD_ACTIONS } from '~/constants/pageSections';
import { proseToHeaderText } from '~/lib/utils/prose';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import TrashIcon from '~/public/icons/trash.svg';
import { HeaderContent } from '~/shared/components/block/content-types/header-content/HeaderContent';
import { ParagraphContent } from '~/shared/components/block/content-types/paragraph-content/ParagraphContent';
import Button from '~/shared/components/design-system/button/Button';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { useManagedPageSections } from '~/shared/hooks/use-managed-page-sections/useManagedPageSections';
import { useStore } from '~/store';
import { CONTENT_TYPE } from '~/types/blocks/contentTypes';
import type { ProseDoc } from '~/types/common';

interface PageSectionCardProps {
  section: PageSection;
  index: number;
  locale: 'uk' | 'en';
  onChange: (next: PageSection) => void;
  onDelete: () => void;
}

const PageSectionCard = ({ section, index, locale, onChange, onDelete }: PageSectionCardProps) => {
  const updateItemValue = (itemId: string, value: PageSection['items'][number]['value'][typeof locale]) => {
    onChange({
      ...section,
      items: section.items.map((item) =>
        item.id === itemId ? { ...item, value: { ...item.value, [locale]: value } } : item
      )
    });
  };

  const removeItem = (itemId: string) => {
    onChange({ ...section, items: section.items.filter((item) => item.id !== itemId) });
  };

  const addItem = (type: SectionItemType) => {
    onChange({ ...section, items: [...section.items, createSectionItem(type)] });
  };

  const handleItemsDragEnd = (event: DragEndEvent) => {
    handleSortableDragEnd(event, section.items, (items) => onChange({ ...section, items }));
  };

  const itemList = section.items.map((item) => (
    <SortableItemWrapper id={item.id} key={item.id} gripHandle gripPosition="top">
      <Box sx={styles.item}>
        <Box sx={styles.itemContent}>
          <ParagraphContent
            item={{
              id: item.id,
              type: CONTENT_TYPE.PARAGRAPH,
              value: item.value,
              label: SECTION_ITEM_LABEL[item.type]
            }}
            locale={locale}
            pageId="page-sections"
            blockId={section.id}
            onChange={(next) => updateItemValue(item.id, next.value[locale])}
          />
        </Box>
        <IconButton aria-label="Видалити" onClick={() => removeItem(item.id)} sx={styles.trashButton}>
          <TrashIcon />
        </IconButton>
      </Box>
    </SortableItemWrapper>
  ));

  return (
    <CollapsibleBlock
      title={proseToHeaderText(section.title[locale] as ProseDoc, sectionOrdinalTitle(index))}
      grip
      defaultExpanded
      onDelete={onDelete}
    >
      <Box sx={styles.cardBody}>
        <HeaderContent
          item={{ id: `${section.id}-title`, type: CONTENT_TYPE.HEADER, title: section.title }}
          locale={locale}
          pageId="page-sections"
          blockId={section.id}
          onChange={(next) => onChange({ ...section, title: next.title })}
        />

        {section.items.length > 0 && (
          <SortableList
            id={`page-section-items-${section.id}`}
            items={section.items.map((item) => item.id)}
            onDragEnd={handleItemsDragEnd}
          >
            {itemList}
          </SortableList>
        )}

        <Box sx={styles.addBar}>
          {PAGE_SECTION_ADD_ACTIONS.map((action) => (
            <Button
              key={action.type}
              variant="outlined"
              color="primary"
              startIcon={<Plus size={16} />}
              onClick={() => addItem(action.type)}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </Box>
    </CollapsibleBlock>
  );
};

type PageSectionsEditorProps = {
  pageSlug: string;
};

export const PageSectionsEditor = ({ pageSlug }: PageSectionsEditorProps) => {
  const locale = useStore((state) => state.locale);
  const { sections, addSection, updateSection, removeSection, reorderSections } = useManagedPageSections(pageSlug);

  const handleDragEnd = (event: DragEndEvent) => {
    handleSortableDragEnd(event, sections, reorderSections);
  };

  return (
    <Box sx={styles.root}>
      {sections.length > 0 && (
        <SortableList id="admin-page-sections" items={sections.map((section) => section.id)} onDragEnd={handleDragEnd}>
          {sections.map((section, index) => (
            <Box key={section.id} sx={styles.sectionSlot}>
              <SortableItemWrapper id={section.id}>
                <PageSectionCard
                  section={section}
                  index={index}
                  locale={locale}
                  onChange={updateSection}
                  onDelete={() => removeSection(section.id)}
                />
              </SortableItemWrapper>
            </Box>
          ))}
        </SortableList>
      )}

      <Box sx={styles.addSectionRow}>
        <Button variant="filled" color="primary" startIcon={<Plus size={16} />} onClick={addSection}>
          Додати секцію
        </Button>
      </Box>
    </Box>
  );
};
