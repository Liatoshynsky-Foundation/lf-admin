import { DragEndEvent } from '@dnd-kit/core';
import { Box } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import { SortableItemWrapper } from '../../sortable-item-wrapper/SortableItemWrapper';
import { SectionListItem } from './EditableSectionList';
import { CustomTextField } from '~/components/design-system/text-field/TextField';

type EditableSectionListItemProps = {
  item: SectionListItem;
  onChangeItem: (id: string, field: 'title' | 'description', value: JSONContent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
};

export const EditableSectionListItem = ({
  item,
  onChangeItem,
  onDragEnd
}: EditableSectionListItemProps) => {
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
