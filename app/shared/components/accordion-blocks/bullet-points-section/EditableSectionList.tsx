import { Box, Typography } from '@mui/material';

import { styles } from './BulletPointsSection.styles';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';
import { CustomTextField } from '~/components/design-system/text-field/TextField';
import { ConfigurableListItem } from '~/types/accordionBlocks';

export type SectionListItem = ConfigurableListItem & {
  title: string;
  description: string;
};

type EditableSectionListProps<ItemType extends SectionListItem> = {
  title: string;
  onTitleChange: (value: string) => void;
  items: ItemType[];
  onChangeItem: (id: string, field: 'title' | 'description', value: string) => void;
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
        label="Заголовок пункту"
        value={item.title}
        onChange={(e) => onChangeItem(item.id as string, 'title', e.target.value)}
        fullWidth
      />
      <CustomTextField
        label="Текст пункту"
        value={item.description}
        onChange={(e) => onChangeItem(item.id as string, 'description', e.target.value)}
        fullWidth
      />
    </Box>
  );

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <CustomTextField
        title="Заголовок секції"
        label="Текст заголовку"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        fullWidth
        multiline
      />
      <Box>
        <Typography variant="subtitle2" sx={styles.title}>
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
