'use client';

import { Box } from '@mui/material';

import { styles } from './ConfigurableList.styles';
import ItemWrapper from '~/components/configurable-list/item-wrapper/ItemWrapper';
import Button from '~/ds-components/button/Button';
import PlusIcon from '~/public/icons/plus.svg';
import { ConfigurableListItem } from '~/types/accordionBlocks';

interface RenderItemParams<T> {
  item: T;
  onChange: (newValue: T) => void;
}

interface ConfigurableListProps<T extends ConfigurableListItem> {
  items: T[];
  renderItem: (params: RenderItemParams<T>) => React.ReactNode;
  addBtnLabel: string;
  editable: boolean;
  onCreate: () => void;
  onChange: (newValue: T) => void;
  onDelete: (id: T['id']) => void;
  separator?: boolean;
}

const ConfigurableList = <T extends ConfigurableListItem>({
  separator,
  onChange,
  onCreate,
  onDelete,
  renderItem,
  items,
  addBtnLabel,
  editable
}: ConfigurableListProps<T>) => {
  const withSeparator = (index: number) => Boolean(separator && index < items.length - 1);

  const list = items.map((item, index) => (
    <ItemWrapper
      key={item.id}
      editable={index !== 0 && editable}
      withSeparator={withSeparator(index)}
      onDelete={() => onDelete(item.id)}
    >
      {renderItem({
        item,
        onChange: (newValue) => onChange(newValue)
      })}
    </ItemWrapper>
  ));

  return (
    <Box>
      <Box sx={styles.container}>{list}</Box>
      <Button startIcon={<PlusIcon />} variant="outlined" color="primary" onClick={onCreate}>
        {addBtnLabel}
      </Button>
    </Box>
  );
};

export default ConfigurableList;
