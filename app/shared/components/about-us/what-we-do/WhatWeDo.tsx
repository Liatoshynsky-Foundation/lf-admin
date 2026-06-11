import { Skeleton } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import { EditableSectionList, SectionListItem } from '../../accordion-blocks/editable-section-list/EditableSectionList';
import { styles } from './WhatWeDo.styles';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { ensureIds } from '~/lib/utils/ensureIds';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { LocalizedString } from '~/types/common';
import type { WhatWeDolItemWithId } from '~/types/store/pages/about-us/blocks/whatWeDoBlock';

const WhatWeDo = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.WHAT_WE_DO;

  const { block } = usePageBlock(pageId, blockId);

  const currentLocale: keyof LocalizedString = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);

  if (!block) return <Skeleton sx={styles.skeletonPlaceholder} />;

  const itemList: WhatWeDolItemWithId[] = ensureIds(block.items);

  const points: SectionListItem[] = itemList.map((item) => ({
    id: item.id,
    title: item.title[currentLocale],
    description: item.description[currentLocale]
  }));

  const handleTitleChange = (value: JSONContent) =>
    setField(pageId, blockId, 'title', { ...block.title, [currentLocale]: value });

  const handleChangeItem = (id: string, field: 'title' | 'description', value: JSONContent) => {
    const updatedList = itemList.map((item) => {
      if (item.id !== id) return item;

      return { ...item, [field]: { ...item[field], [currentLocale]: value } };
    });
    setField(pageId, blockId, 'items', updatedList);
  };

  const handleCreateItem = (): SectionListItem => {
    const newItem: WhatWeDolItemWithId = {
      id: crypto.randomUUID(),
      title: { uk: {}, en: {} },
      description: { uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } }
    };
    setField(pageId, blockId, 'items', [...itemList, newItem]);
    return { id: newItem.id, title: {}, description: {} };
  };

  const handleDeleteItem = (id: string) =>
    setField(
      pageId,
      blockId,
      'items',
      itemList.filter((item) => item.id !== id)
    );

  return (
    <CollapsibleBlock title="Що ми робимо">
      <EditableSectionList
        title={block.title[currentLocale]}
        onTitleChange={handleTitleChange}
        items={points}
        onChangeItem={handleChangeItem}
        onCreateItem={handleCreateItem}
        onDeleteItem={handleDeleteItem}
        sectionLabel="Пункти секції:"
      />
    </CollapsibleBlock>
  );
};
export default WhatWeDo;
