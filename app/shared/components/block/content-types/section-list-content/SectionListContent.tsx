import { DragEndEvent } from '@dnd-kit/core';
import { Typography } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import type { ContentTypeProps } from '../ContentType.types';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { EditableSectionListItem } from '~/shared/components/accordion-blocks/editable-section-list/EditableSectionListItem';
import ConfigurableList from '~/shared/components/configurable-list/ConfigurableList';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import type { SectionListContentItem, SectionListEntry } from '~/types/blocks/contentTypes';

const emptyDoc = (): JSONContent => ({ type: 'doc', content: [] });

export const SectionListContent = ({ item, locale, onChange }: ContentTypeProps<SectionListContentItem>) => {
  const setItems = (items: SectionListEntry[]) => onChange({ ...item, items });

  const uiItems = item.items.map((entry) => ({
    id: entry.id,
    title: entry.title[locale] as JSONContent,
    description: entry.description[locale] as JSONContent
  }));

  const handleChangeItem = (id: string, field: 'title' | 'description', value: JSONContent) => {
    setItems(
      item.items.map((entry) => (entry.id === id ? { ...entry, [field]: { ...entry[field], [locale]: value } } : entry))
    );
  };

  const handleCreateItem = () => {
    const doc = emptyDoc();
    const newEntry: SectionListEntry = {
      id: crypto.randomUUID(),
      title: { uk: doc, en: doc },
      description: { uk: doc, en: doc }
    };
    setItems([...item.items, newEntry]);
    return { id: newEntry.id, title: doc, description: doc };
  };

  const handleDeleteItem = (id: string) => setItems(item.items.filter((entry) => entry.id !== id));

  const handleDragEnd = (event: DragEndEvent) => handleSortableDragEnd(event, item.items, setItems);

  return (
    <>
      <Typography variant="subtitle1" component="h4">
        {item.label ?? 'Пункти секції:'}
      </Typography>
      <SortableList
        id={`section-list-${item.id}`}
        items={item.items.map((entry) => entry.id)}
        onDragEnd={handleDragEnd}
      >
        <ConfigurableList
          items={uiItems}
          addBtnLabel="Додати пункт"
          editable
          onCreate={handleCreateItem}
          onChange={() => undefined}
          onDelete={handleDeleteItem}
          separator
          renderItem={({ item: uiItem }) => <EditableSectionListItem item={uiItem} onChangeItem={handleChangeItem} />}
        />
      </SortableList>
    </>
  );
};
