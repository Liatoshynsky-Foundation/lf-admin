import { DragEndEvent } from '@dnd-kit/core';
import { JSONContent } from '@tiptap/react';
import { useCallback, useMemo } from 'react';

import { generateUniqueId } from '~/lib/utils/generateUniqueId';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import type { SectionListEntry } from '~/types/blocks/contentTypes';

const emptyDoc = (): JSONContent => ({ type: 'doc', content: [] });

export type SectionListUiItem = {
  id: string;
  title: JSONContent;
  description: JSONContent;
};

interface UseSectionListContentProps {
  items: SectionListEntry[];
  locale: 'uk' | 'en';
  onItemsChange: (items: SectionListEntry[]) => void;
}

export const useSectionListContent = ({ items, locale, onItemsChange }: UseSectionListContentProps) => {
  const uiItems = useMemo<SectionListUiItem[]>(
    () =>
      items.map((entry) => ({
        id: entry.id,
        title: entry.title[locale] as JSONContent,
        description: entry.description[locale] as JSONContent
      })),
    [items, locale]
  );

  const changeItem = useCallback(
    (id: string, field: 'title' | 'description', value: JSONContent) => {
      onItemsChange(
        items.map((entry) => (entry.id === id ? { ...entry, [field]: { ...entry[field], [locale]: value } } : entry))
      );
    },
    [items, locale, onItemsChange]
  );

  const createItem = useCallback(() => {
    const doc = emptyDoc();
    const newEntry: SectionListEntry = {
      id: generateUniqueId(),
      title: { uk: doc, en: doc },
      description: { uk: doc, en: doc }
    };

    onItemsChange([...items, newEntry]);

    return { id: newEntry.id, title: doc, description: doc };
  }, [items, onItemsChange]);

  const deleteItem = useCallback(
    (id: string) => onItemsChange(items.filter((entry) => entry.id !== id)),
    [items, onItemsChange]
  );

  const dragEnd = useCallback(
    (event: DragEndEvent) => handleSortableDragEnd(event, items, onItemsChange),
    [items, onItemsChange]
  );

  return {
    uiItems,
    changeItem,
    createItem,
    deleteItem,
    dragEnd
  };
};
