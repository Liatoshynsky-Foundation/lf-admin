'use client';

import { Skeleton, Typography } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import ConfigurableList from '../../configurable-list/ConfigurableList';
import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';


export const DataUsage = () => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;
  const blockId = BLOCK_IDS.DATA_USAGE;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);


  if (!block) return <Skeleton sx={{ height: '60px' }} />;

  const list = ensureIds(block.list);

  const points = list.map((item) => ({
    id: item.id,
    value: item[currentLocale]
  }));

  const handleChangeTitleText = (value: JSONContent) => {
    setField(pageId, blockId, 'title', {
      ...block.title,
      [currentLocale]: value
    });
  };

  return (
    <CollapsibleBlock title="Як ми використовуємо ваші дані">
      <CustomTextField
        fieldType="formatting"
        title="Вступний текст секції"
        value={block.description[currentLocale]}
        onChange={(value) => handleChangeTitleText(value)}
      />

      {points.length > 0 && (
        <>
          <Typography variant="subtitle1" component="h4">
            Пункти:
          </Typography>
          <ConfigurableList
            items={points}
            addBtnLabel="Додати пункт"
            editable
            onChange={()=>{}}
            onDelete={()=>{}}
            onCreate={()=>{}}
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
      )}

    </CollapsibleBlock>
  );
};
