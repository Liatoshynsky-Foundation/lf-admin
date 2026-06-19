import { DragEndEvent } from '@dnd-kit/core';
import { Typography } from '@mui/material';

import ConfigurableList from '~/shared/components/configurable-list/ConfigurableList';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { ListPoint } from '~/shared/hooks/use-points-list/usePointsList';

export interface PointsListProps {
  id: string;
  points: ListPoint[];
  addPoint: () => void;
  updatePoint: (newValue: ListPoint) => void;
  removePoint: (id: string) => void;
  onDragEnd?: (event: DragEndEvent) => void;
}

export const PointsList = ({ id, points, addPoint, updatePoint, removePoint, onDragEnd }: PointsListProps) => {
  const renderItem = ({ item, onChange }: { item: ListPoint; onChange: (newValue: ListPoint) => void }) => {
    const field = (
      <CustomTextField
        fieldType="formatting"
        label="Текст пункту"
        value={item.value}
        onChange={(value) => onChange({ ...item, value })}
      />
    );

    if (onDragEnd) {
      return (
        <SortableItemWrapper id={item.id} key={item.id} gripHandle gripPosition="top">
          {field}
        </SortableItemWrapper>
      );
    }
    return field;
  };

  const listContent = (
    <ConfigurableList<ListPoint>
      items={points}
      addBtnLabel="Додати пункт"
      editable
      onCreate={addPoint}
      onChange={updatePoint}
      onDelete={removePoint}
      renderItem={renderItem}
      separator={false}
    />
  );

  return (
    <>
      <Typography variant="subtitle1" component="h4">
        Пункти:
      </Typography>
      {onDragEnd ? (
        <SortableList id={`points-list-${id}`} items={points.map((p) => p.id)} onDragEnd={onDragEnd}>
          {listContent}
        </SortableList>
      ) : (
        listContent
      )}
    </>
  );
};