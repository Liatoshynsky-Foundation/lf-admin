'use client';

import { Box, SxProps, Theme, Typography } from '@mui/material';

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
  showAddButton?: boolean;
  addButtonDisabled?: boolean;
  addButtonMessage?: string;
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
  addButtonSx,
  showAddButton = true,
  addButtonDisabled = false,
  addButtonMessage
}: ConfigurableListProps<T>) => {
  const withSeparator = (index: number) => Boolean(separator && index < items.length - 1);

  const list = items.map((item, index) => {
    const itemKey = item.id ?? index;
    const content = (
      <ItemWrapper
        key={itemKey}
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
      <SortableItemWrapper key={itemKey} id={item.id ?? itemKey} gripHandle>
        {content}
      </SortableItemWrapper>
    ) : (
      content
    );
  });

  const listContent = sortable ? (
    <SortableList
      id="configurable-list"
      items={items.map((item, index) => item.id ?? index)}
      onDragEnd={(event) => handleSortableDragEnd(event, items, onReorder ?? (() => undefined))}
    >
      {list}
    </SortableList>
  ) : list;

  return (
    <Box sx={{ width: '100%', ...addButtonSx }}>
      <Box sx={styles.container}>{listContent}</Box>
      {showAddButton && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button
            sx={{ width: 'fit-content' }}
            startIcon={<PlusIcon />}
            variant="outlined"
            color="primary"
            disabled={addButtonDisabled}
            onClick={onCreate}
          >
            {addBtnLabel}
          </Button>
          {addButtonMessage && (
            <Typography variant="body2" role="status">
              {addButtonMessage}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ConfigurableList;
