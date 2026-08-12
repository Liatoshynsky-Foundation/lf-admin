import { DragEndEvent } from '@dnd-kit/core';
import { Typography } from '@mui/material';

import type { ContentTypeProps } from '../ContentType.types';
import { generateUniqueId } from '~/lib/utils/generateUniqueId';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import ConfigurableList from '~/shared/components/configurable-list/ConfigurableList';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import type { ListContentItem } from '~/types/blocks/contentTypes';

type ListEntry = ListContentItem['items'][number];

export const ListContent = ({ item, locale, onChange }: ContentTypeProps<ListContentItem>) => {
  const setItems = (items: ListEntry[]) => onChange({ ...item, items });

  const handleAdd = () =>
    setItems([
      ...item.items,
      { id: generateUniqueId(), uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } }
    ]);

  const handleChange = (next: ListEntry) => setItems(item.items.map((entry) => (entry.id === next.id ? next : entry)));

  const handleDelete = (id: string) => setItems(item.items.filter((entry) => entry.id !== id));

  const handleDragEnd = (event: DragEndEvent) => handleSortableDragEnd(event, item.items, setItems);

  return (
    <>
      {item.label && (
        <Typography variant="subtitle1" component="h4">
          {item.label}
        </Typography>
      )}
      <SortableList id={`list-${item.id}`} items={item.items.map((entry) => entry.id)} onDragEnd={handleDragEnd}>
        <ConfigurableList<ListEntry>
          items={item.items}
          addBtnLabel="Додати пункт"
          editable
          onCreate={handleAdd}
          onChange={handleChange}
          onDelete={handleDelete}
          separator={false}
          renderItem={({ item: entry, onChange: onEntryChange }) => (
            <SortableItemWrapper id={entry.id} key={entry.id} gripHandle gripPosition="top">
              <CustomTextField
                fieldType="formatting"
                label="Текст пункту"
                value={entry[locale]}
                onChange={(value) => onEntryChange({ ...entry, [locale]: value })}
              />
            </SortableItemWrapper>
          )}
        />
      </SortableList>
    </>
  );
};
