import { DragEndEvent } from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import { SortableList } from '../../sortable-list/SortableList';
import { styles } from './EditableSectionList.styles';
import { EditableSectionListItem } from './EditableSectionListItem';
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

  const listContent = (
    <ConfigurableList
      items={items}
      renderItem={({ item }: { item: ItemType }) => (
        <EditableSectionListItem
          item={item}
          onChangeItem={onChangeItem}
          onDragEnd={onDragEnd}
        />
      )}
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
