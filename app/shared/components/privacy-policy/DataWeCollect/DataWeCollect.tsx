'use client';

import { Skeleton } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import { EditableSectionList, SectionListItem } from '../../accordion-blocks/editable-section-list/EditableSectionList';
import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { ItemWithId } from '~/types/store/pages/privacy-policy';


export const DataWeCollect = () => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;
  const blockId = BLOCK_IDS.DATA_WE_COLLECT;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);


  if (!block) return <Skeleton sx={{ height: '60px' }} />;

  const sectionsList: ItemWithId[] = ensureIds(block.sections);

  const sections: SectionListItem[] = sectionsList.map((item) => ({
    id: item.id,
    title: item.subtitle[currentLocale],
    description: item.list
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

      <EditableSectionList
        title={block.title[currentLocale]}
        onTitleChange={() => { }}
        items={sections}
        onChangeItem={() => { }}
        onCreateItem={() => { }}
        onDeleteItem={() => { }}
        sectionLabel="Пункти секції:"
      />

      <CustomTextField
        fieldType="formatting"
        title="Додаткова інформація"
        value={block.note[currentLocale]}
        onChange={(value) => handleChangeTitleText(value)}
      />
    </CollapsibleBlock>
  );
};
