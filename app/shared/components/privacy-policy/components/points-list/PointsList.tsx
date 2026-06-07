import { Typography } from '@mui/material';

import ConfigurableList from '~/shared/components/configurable-list/ConfigurableList';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import { ListPoint } from '~/shared/hooks/use-points-list/usePointsList';

interface PointsListProps {
    points: ListPoint[],
    addPoint: () => ListPoint;
    updatePoint: (newValue: ListPoint) => void;
    removePoint: (id: string) => void;
}

export const PointsList = ({ points, addPoint, updatePoint, removePoint }: PointsListProps) => {
  return (
    <>
      <Typography variant="subtitle1" component="h4">
        Пункти:
      </Typography>
      <ConfigurableList<ListPoint>
        items={points}
        addBtnLabel="Додати пункт"
        editable
        onCreate={addPoint}
        onChange={updatePoint}
        onDelete={removePoint}
        renderItem={({ item, onChange }) => (
          <CustomTextField
            fieldType="formatting"
            label="Текст пункту"
            value={item.value}
            onChange={(value) => onChange({ ...item, value })}
          />
        )}
        separator={false}
      />
    </>
  );
};