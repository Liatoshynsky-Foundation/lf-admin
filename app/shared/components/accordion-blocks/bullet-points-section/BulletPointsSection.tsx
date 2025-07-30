'use client';

import { Box, debounce, Typography } from '@mui/material';
import { useState } from 'react';

import ConfigurableList from '../../configurable-list/ConfigurableList';
import { BulletPointsItem, hardcodedData } from './BulletPointsSection.const';
import { styles } from './BulletPointsSection.styles';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/ds-components/text-field/TextField';

interface IBulletPointsSectionProps {
  bulletPointsTitle: string;
  defaultSectionTitle: string;
}

const BulletPointsSection: React.FC<IBulletPointsSectionProps> = ({ bulletPointsTitle, defaultSectionTitle }) => {
  const [sectionTitle, setSectionTitle] = useState(defaultSectionTitle);
  const [bulletPoints, setBulletPoints] = useState<BulletPointsItem[]>(hardcodedData.bulletPoints);

  const onCreate = () => {
    const newBulletPoint: BulletPointsItem = { id: bulletPoints.length + 1, title: '', text: '' };
    setBulletPoints((prev) => [...prev, newBulletPoint]);
    return newBulletPoint;
  };

  const onChange = (newValue: BulletPointsItem) => {
    setBulletPoints((prev) =>
      prev.map((bulletPoint) =>
        bulletPoint.id === newValue.id ? { ...bulletPoint, title: newValue.title, text: newValue.text } : bulletPoint
      )
    );
  };

  const onTitleChangeDelayed = debounce(setSectionTitle, 200);
  const onChangeDelayed = debounce(onChange, 200);

  const onDelete = (id: BulletPointsItem['id']) => {
    setBulletPoints((prev) => prev.filter((bulletPoint) => bulletPoint.id !== id));
  };

  const renderItem = ({
    item,
    onChange
  }: {
    item: BulletPointsItem;
    onChange: (newValue: BulletPointsItem) => void;
  }) => {
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
    <CollapsibleBlock title={bulletPointsTitle}>
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
            items={bulletPoints}
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

export default BulletPointsSection;
