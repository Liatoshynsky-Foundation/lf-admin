import { DragEndEvent } from '@dnd-kit/core';
import { JSONContent } from '@tiptap/react';
import { useCallback, useMemo } from 'react';

import { ensureIds } from '~/lib/utils/ensureIds';
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
  const itemsWithIds = useMemo(() => ensureIds(items), [items]);

  const uiItems = useMemo<SectionListUiItem[]>(
    () =>
      itemsWithIds.map((entry) => ({
        id: entry.id,
        title: entry.title[locale] as JSONContent,
        description: entry.description[locale] as JSONContent
      })),
    [itemsWithIds, locale]
  );

  const changeItem = useCallback(
    (id: string, field: 'title' | 'description', value: JSONContent) => {
      onItemsChange(
        itemsWithIds.map((entry) =>
          entry.id === id ? { ...entry, [field]: { ...entry[field], [locale]: value } } : entry
        )
      );
    },
    [itemsWithIds, locale, onItemsChange]
  );

  const createItem = useCallback(() => {
    const doc = emptyDoc();
    const newEntry: SectionListEntry = {
      id: generateUniqueId(),
      title: { uk: doc, en: doc },
      description: { uk: doc, en: doc }
    };

    onItemsChange([...itemsWithIds, newEntry]);

    return { id: newEntry.id, title: doc, description: doc };
  }, [itemsWithIds, onItemsChange]);

  const deleteItem = useCallback(
    (id: string) => onItemsChange(itemsWithIds.filter((entry) => entry.id !== id)),
    [itemsWithIds, onItemsChange]
  );

  const dragEnd = useCallback(
    (event: DragEndEvent) => handleSortableDragEnd(event, itemsWithIds, onItemsChange),
    [itemsWithIds, onItemsChange]
  );

  return {
    uiItems,
    changeItem,
    createItem,
    deleteItem,
    dragEnd
  };
};
