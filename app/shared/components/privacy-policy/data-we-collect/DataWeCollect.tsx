'use client';

import { Box, Skeleton } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import ConfigurableList from '../../configurable-list/ConfigurableList';
import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';


export const DataWeCollect = () => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;
  const blockId = BLOCK_IDS.DATA_WE_COLLECT;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);


  if (!block) return <Skeleton sx={{ height: '60px' }} />;

  const sectionsList = ensureIds(block.sections);

  const sections = sectionsList.map((item) => ({
    id: item.id,
    title: item.subtitle[currentLocale],
    points: ensureIds(item.list)
  }));

  const handleChangeTitleText = (value: JSONContent) => {
    setField(pageId, blockId, 'title', {
      ...block.title,
      [currentLocale]: value
    });
  };

  return (
    <CollapsibleBlock title="Які дані ми збираємо та чому">
      <CustomTextField
        fieldType="formatting"
        title="Вступний текст секції"
        value={block.description[currentLocale]}
        onChange={(value) => handleChangeTitleText(value)}
      />
      {
        sections.map((section, index)=>(
          <Box key={section.id}>
            <CustomTextField
              fieldType="formatting"
              title={`Список ${index+1}`}
              value={section.title}
              onChange={(value) => handleChangeTitleText(value)}
            />
            <ConfigurableList
              items={section.points}
              renderItem={({ item }: { item }) => (
                <Box display="flex" flexDirection="column" gap="16px">
                  {item.title && (<CustomTextField
                    fieldType="formatting"
                    label="Заголовок пункту"
                    value={item.title}
                    onChange={()=>{}}
                  />)}
                  <CustomTextField
                    fieldType="formatting"
                    label="Текст пункту"
                    value={item.description}
                    onChange={()=>{}}
                  />
                </Box>
              )}
              addBtnLabel="Додати пункт"
              onChange={()=>{}}
              onCreate={()=>{}}
              onDelete={()=>{}}
              editable
            />
          </Box>
        ))
      }

      <CustomTextField
        fieldType="formatting"
        title="Додаткова інформація"
        value={block.note[currentLocale]}
        onChange={(value) => handleChangeTitleText(value)}
      />
    </CollapsibleBlock>
  );
};
