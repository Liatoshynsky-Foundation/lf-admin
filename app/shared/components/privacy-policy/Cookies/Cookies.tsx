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
import { ConfigurableListItem } from '~/types/accordionBlocks';

export type CookiesPoint = ConfigurableListItem & { value: JSONContent };

export const Cookies = () => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;
  const blockId = BLOCK_IDS.COOKIES;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);

  if (!block) return <Skeleton sx={{ height: '60px' }} />;

  const list = ensureIds(block.list);

  const cookiesPoints = list.map((item) => ({
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
    <CollapsibleBlock title="Які cookie ми використовуємо">
      <CustomTextField
        fieldType="formatting"
        title="Вступний текст секції"
        value={block.description[currentLocale]}
        onChange={(value) => handleChangeTitleText(value)}
      />

      {cookiesPoints.length > 0 && (
        <>
          <Typography variant="subtitle1" component="h4">
            Текст секції:
          </Typography>
          <ConfigurableList<CookiesPoint>
            items={cookiesPoints}
            addBtnLabel="Додати пункт"
            editable
            onChange={()=>{}}
            onDelete={()=>{}}
            onCreate={()=>{}}
            renderItem={({ item, onChange }) => (
              <CustomTextField
                fieldType="formatting"
                label="Пункт cookies"
                value={item.value}
                onChange={(value) => onChange({ ...item, value })}
              />
            )}
            separator={false}
          />
        </>
      )}
 
      <CustomTextField
        fieldType="formatting"
        title="Додаткова інформація"
        value={block.note[currentLocale]}
        onChange={(value) => handleChangeTitleText(value)}
      />

    </CollapsibleBlock>
  );
};
