'use client';

import { Box, IconButton } from '@mui/material';
import { Plus } from 'lucide-react';

import { type PageSection } from './pageSection.types';
import { SECTION_ITEM_LABEL, sectionOrdinalTitle } from './pageSection.utils';
import { styles } from './PageSectionCard.styles';
import { usePageSectionItems } from './usePageSectionItems';
import { PAGE_SECTION_ADD_ACTIONS } from '~/constants/pageSections';
import { proseToHeaderText } from '~/lib/utils/prose';
import TrashIcon from '~/public/icons/trash.svg';
import { HeaderContent } from '~/shared/components/block/content-types/header-content/HeaderContent';
import { ParagraphContent } from '~/shared/components/block/content-types/paragraph-content/ParagraphContent';
import Button from '~/shared/components/design-system/button/Button';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { CONTENT_TYPE } from '~/types/blocks/contentTypes';
import type { ProseDoc } from '~/types/common';

interface PageSectionCardProps {
  section: PageSection;
  index: number;
  locale: 'uk' | 'en';
  onChange: (next: PageSection) => void;
  onDelete: () => void;
}

export const PageSectionCard = ({ section, index, locale, onChange, onDelete }: PageSectionCardProps) => {
  const { updateItemValue, removeItem, addItem, handleItemsDragEnd } = usePageSectionItems(section, locale, onChange);

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
