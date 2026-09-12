'use client';

import { Box, SxProps, Theme } from '@mui/material';

import { styles } from './ConfigurableList.styles';
import ItemWrapper from '~/components/configurable-list/item-wrapper/ItemWrapper';
import Button from '~/ds-components/button/Button';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import PlusIcon from '~/public/icons/plus.svg';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { ConfigurableListItem } from '~/types/accordionBlocks';

export interface RenderItemParams<T> {
  item: T;
  onChange: (newValue: T) => void;
  onDelete: () => void;
  index: number;
}

export interface ConfigurableListProps<T extends ConfigurableListItem> {
  items: T[];
  renderItem: (params: RenderItemParams<T>) => React.ReactNode;
  addBtnLabel: string;
  editable: boolean;
  onCreate: () => void;
  onChange: (newValue: T) => void;
  onDelete: (id: T['id']) => void;
  sortable?: boolean;
  onReorder?: (newItems: T[]) => void;
  separator?: boolean;
  allowFirstItemDeletion?: boolean;
  addButtonSx?: SxProps<Theme>;
}

const ConfigurableList = <T extends ConfigurableListItem>({
  separator,
  onChange,
  onCreate,
  onDelete,
  sortable = false,
  onReorder,
  renderItem,
  items,
  addBtnLabel,
  editable,
  allowFirstItemDeletion = false,
  addButtonSx
}: ConfigurableListProps<T>) => {
  const withSeparator = (index: number) => Boolean(separator && index < items.length - 1);

  const list = items.map((item, index) => {
    const content = (
      <ItemWrapper
        key={item.id}
        editable={editable && (allowFirstItemDeletion || index !== 0)}
        withSeparator={withSeparator(index)}
        onDelete={() => onDelete(item.id)}
      >
        {renderItem({
          item,
          onChange: (newValue) => onChange(newValue),
          onDelete: () => onDelete(item.id),
          index
        })}
      </ItemWrapper>
    );

    return sortable ? (
      <SortableItemWrapper key={item.id} id={item.id} gripHandle>
        {content}
      </SortableItemWrapper>
    ) : content;
  });

  const listContent = sortable ? (
    <SortableList
      id="configurable-list"
      items={items.map((item) => item.id)}
      onDragEnd={(event) => handleSortableDragEnd(event, items, onReorder ?? (() => undefined))}
    >
      {list}
    </SortableList>
  ) : list;

  return (
    <Box sx={{ width: '100%', ...addButtonSx }}>
      <Box sx={styles.container}>{listContent}</Box>
      <Button
        sx={{ width: 'fit-content', mx: 'auto' }}
        startIcon={<PlusIcon />}
        variant="outlined"
        color="primary"
        onClick={onCreate}
      >
        {addBtnLabel}
      </Button>
    </Box>
  );
};

export default ConfigurableList;
