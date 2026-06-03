import { Skeleton } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import { EditableSectionList } from '../../accordion-blocks/editable-section-list/EditableSectionList';
import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

export const UserRights = () => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;
  const blockId = BLOCK_IDS.USER_RIGHTS;
  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((value)=>value.locale);
  const setField = useStore((value)=>value.setField);


  if(!block) return <Skeleton sx={{height: '60px'}} />;
  const list = ensureIds(block.list);

  const points = list.map((item) => ({
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
    <CollapsibleBlock title="Ваші права">
      <CustomTextField
        fieldType="formatting"
        title="Вступний текст секції"
        value={block.description[currentLocale]}
        onChange={(value) => handleChangeTitleText(value)}
      />
      <EditableSectionList
        title={block.title[currentLocale]}
        onTitleChange={()=>{}}
        items={points}
        onChangeItem={()=>{}}
        onCreateItem={()=>{}}
        onDeleteItem={()=>{}}
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