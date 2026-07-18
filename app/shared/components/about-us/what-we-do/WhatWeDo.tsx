import { DragEndEvent } from '@dnd-kit/core';
import { JSONContent} from '@tiptap/react';

import { EditableSectionList, SectionListItem } from '../../accordion-blocks/editable-section-list/EditableSectionList';
import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { ensureIds } from '~/lib/utils/ensureIds';
import { proseToHeaderText } from '~/lib/utils/prose';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { LocalizedString, ProseDoc } from '~/types/common';
import type { WhatWeDolItemWithId } from '~/types/store/pages/about-us/blocks/whatWeDoBlock';

const WhatWeDo = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.WHAT_WE_DO;

  const { block } = usePageBlock(pageId, blockId);

  const currentLocale: keyof LocalizedString = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);
  const toggleBlockVisibility = useStore((state) => state.toggleBlockVisibility);

  const itemList: WhatWeDolItemWithId[] = block ? ensureIds(block.items) : [];

  const handleDragEnd = (event: DragEndEvent) => {
    handleSortableDragEnd(event, itemList, (reordered) => {
      setField(pageId, blockId, 'items', reordered);
    });
  };

  if (!block) return <EditBlockSkeleton />;

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

  const headerTitle = proseToHeaderText(block.title?.[currentLocale] as ProseDoc, 'Що ми робимо');

  return (
    <CollapsibleBlock
      title={headerTitle}
      grip
      hidden={block.hidden}
      onToggleVisibility={() => toggleBlockVisibility(pageId, blockId)}
    >
      <EditableSectionList
        title={block.title[currentLocale]}
        onTitleChange={handleTitleChange}
        items={points}
        onChangeItem={handleChangeItem}
        onCreateItem={handleCreateItem}
        onDeleteItem={handleDeleteItem}
        onDragEnd={handleDragEnd}
        sectionLabel="Пункти секції:"
      />
    </CollapsibleBlock>
  );
};
export default WhatWeDo;
