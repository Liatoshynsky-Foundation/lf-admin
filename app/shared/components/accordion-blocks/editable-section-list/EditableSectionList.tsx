import { Box, Typography } from '@mui/material';
import { JSONContent } from '@tiptap/react';

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
};

export const EditableSectionList = <ItemType extends SectionListItem>({
  title,
  onTitleChange,
  items,
  onChangeItem,
  onCreateItem,
  onDeleteItem,
  sectionLabel
}: EditableSectionListProps<ItemType>) => {
  const renderItem = ({ item }: { item: ItemType }) => (
    <Box display="flex" flexDirection="column" gap="16px">
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
      </Box>
    </Box>
  );
};
