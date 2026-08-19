import { Typography } from '@mui/material';

import type { ContentTypeProps } from '../content-type.types';
import { EditableSectionListItem } from '~/shared/components/accordion-blocks/editable-section-list/EditableSectionListItem';
import ConfigurableList from '~/shared/components/configurable-list/ConfigurableList';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { useSectionListContent } from '~/shared/hooks/use-section-list-content/useSectionListContent';
import type { SectionListContentItem } from '~/types/blocks/contentTypes';

export const SectionListContent = ({ item, locale, onChange }: ContentTypeProps<SectionListContentItem>) => {
  const { uiItems, changeItem, createItem, deleteItem, dragEnd } = useSectionListContent({
    items: item.items,
    locale,
    onItemsChange: (items) => onChange({ ...item, items })
  });

  return (
    <>
      <Typography variant="subtitle1" component="h4">
        {item.label ?? 'Пункти секції:'}
      </Typography>
      <SortableList id={`section-list-${item.id}`} items={item.items.map((entry) => entry.id)} onDragEnd={dragEnd}>
        <ConfigurableList
          items={uiItems}
          addBtnLabel="Додати пункт"
          editable
          onCreate={createItem}
          onChange={() => undefined}
          onDelete={deleteItem}
          separator
          renderItem={({ item: uiItem }) => <EditableSectionListItem item={uiItem} onChangeItem={changeItem} />}
        />
      </SortableList>
    </>
  );
};
