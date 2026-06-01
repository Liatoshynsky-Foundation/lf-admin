'use client';

import { Skeleton } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import { EditableSectionList } from '../../accordion-blocks/editable-section-list/EditableSectionList';
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

  const sections = list.map((item) => ({
    id: item.id,
    title: item[currentLocale],
    description: item[currentLocale]
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

      <EditableSectionList
        title={block.title[currentLocale]}
        onTitleChange={() => { }}
        items={sections}
        onChangeItem={() => { }}
        onCreateItem={() => { }}
        onDeleteItem={() => { }}
        sectionLabel="Пункти секції:"
      />

    </CollapsibleBlock>
  );
};
