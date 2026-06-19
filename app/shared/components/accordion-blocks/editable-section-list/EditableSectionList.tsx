import { DragEndEvent } from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import { SortableItemWrapper } from '../../sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '../../sortable-list/SortableList';
import { styles } from './EditableSectionList.styles';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';
import { CustomTextField } from '~/components/design-system/text-field/TextField';
import { ConfigurableListItem } from '~/types/accordionBlocks';

export type SectionListItem = ConfigurableListItem & {
  title: JSONContent;
  description: JSONContent;
};

type EditableSectionListProps<ItemType extends SectionListItem> = {
  title: JSONContent;
  onTitleChange: (value: JSONContent) => void;
  items: ItemType[];
  onChangeItem: (id: string, field: 'title' | 'description', value: JSONContent) => void;
  onCreateItem: () => ItemType;
  onDeleteItem: (id: string) => void;
  sectionLabel: string;
  onDragEnd?: (event: DragEndEvent) => void;
};

export const EditableSectionList = <ItemType extends SectionListItem>({
  title,
  onTitleChange,
  items,
  onChangeItem,
  onCreateItem,
  onDeleteItem,
  sectionLabel,
  onDragEnd
}: EditableSectionListProps<ItemType>) => {
  const renderItem = ({ item }: { item: ItemType }) => {
    const fields = (
      <Box display="flex" flexDirection="column" gap="16px" width="100%">
        <CustomTextField
          fieldType="formatting"
          label="Заголовок пункту"
          value={item.title}
          onChange={(value) => onChangeItem(item.id as string, 'title', value)}
        />
        <CustomTextField
          fieldType="formatting"
          label="Текст пункту"
          value={item.description}
          onChange={(value) => onChangeItem(item.id as string, 'description', value)}
        />
      </Box>
    );

    if (onDragEnd) {
      return (
        <SortableItemWrapper id={item.id as string} key={item.id} gripHandle gripPosition="top">
          {fields}
        </SortableItemWrapper>
      );
    }

    return fields;
  };

  const listContent = (
    <ConfigurableList
      items={items}
      renderItem={renderItem}
      addBtnLabel="Додати пункт"
      onChange={({ id, field, value }) => onChangeItem(id as string, field, value)}
      onCreate={onCreateItem}
      onDelete={(id) => onDeleteItem(id as string)}
      editable
      separator
    />
  );

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <CustomTextField
        fieldType="formatting"
        title="Заголовок секції"
        label="Текст заголовку"
        value={title}
        onChange={(value) => onTitleChange(value)}
      />
      <Box>
        <Typography variant="subtitle1" sx={styles.title}>
          {sectionLabel}
        </Typography>
        {onDragEnd ? (
          <SortableList
            id="editable-section-list"
            items={items.map((it) => it.id as string)}
            onDragEnd={onDragEnd}
          >
            {listContent}
          </SortableList>
        ) : (
          listContent
        )}
      </Box>
    </Box>
  );
};
