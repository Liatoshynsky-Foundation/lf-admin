'use client';

import { Box, debounce, Typography } from '@mui/material';
import { useState } from 'react';

import ConfigurableList from '../../configurable-list/ConfigurableList';
import { GoalItem, hardcodedData } from './OurGoals.const';
import { styles } from './OurGoals.styles';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/ds-components/text-field/TextField';

const OurGoals: React.FC = () => {
  const [sectionTitle, setSectionTitle] = useState(hardcodedData.sectionTitle);
  const [goals, setGoals] = useState<GoalItem[]>(hardcodedData.goals);

  const onCreate = () => {
    const newGoal: GoalItem = { id: goals.length + 1, title: '', text: '' };
    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  };

  const onChange = (newValue: GoalItem) => {
    setGoals((prev) =>
      prev.map((goal) => (goal.id === newValue.id ? { ...goal, title: newValue.title, text: newValue.text } : goal))
    );
  };

  const onTitleChangeDelayed = debounce(setSectionTitle, 200);
  const onChangeDelayed = debounce(onChange, 200);

  const onDelete = (id: GoalItem['id']) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const renderItem = ({ item, onChange }: { item: GoalItem; onChange: (newValue: GoalItem) => void }) => {
    return (
      <Box display="flex" flexDirection="column" gap="16px">
        <CustomTextField
          label="Заголовок пункту"
          defaultValue={item.title}
          onChange={(e) => onChange({ ...item, title: e.target.value })}
          fullWidth
        />
        <CustomTextField
          label="Текст пункту"
          defaultValue={item.text}
          onChange={(e) => onChange({ ...item, text: e.target.value })}
          fullWidth
        />
      </Box>
    );
  };

  return (
    <CollapsibleBlock title={'Наші цілі'}>
      <Box display="flex" flexDirection="column" gap="16px">
        <CustomTextField
          title="Заголовок секції"
          label="Текст заголовку"
          defaultValue={sectionTitle}
          onChange={(e) => onTitleChangeDelayed(e.target.value)}
          fullWidth
          multiline
        />
        <Box>
          <Typography variant="subtitle2" sx={styles.title}>
            Пункти секції:
          </Typography>
          <ConfigurableList
            items={goals}
            renderItem={renderItem}
            addBtnLabel="Додати пункт"
            onChange={onChangeDelayed}
            onCreate={onCreate}
            onDelete={onDelete}
            editable
            separator
          />
        </Box>
      </Box>
    </CollapsibleBlock>
  );
};

export default OurGoals;
