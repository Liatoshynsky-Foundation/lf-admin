import { DragEndEvent } from '@dnd-kit/core';

import type { PageSection, SectionItemType } from './pageSection.types';
import { createSectionItem } from './pageSection.utils';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';

type PageSectionLocale = 'uk' | 'en';

export const usePageSectionItems = (
  section: PageSection,
  locale: PageSectionLocale,
  onChange: (next: PageSection) => void
) => {
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

  return { updateItemValue, removeItem, addItem, handleItemsDragEnd };
};
