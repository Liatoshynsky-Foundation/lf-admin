import { Skeleton } from '@mui/material';

import { EditableSectionList, SectionListItem } from '../../accordion-blocks/bullet-points-section/EditableSectionList';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { ensureIds } from '~/lib/utils/ensureIds';
import { proseToText, textToProse } from '~/lib/utils/prose';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { LocalizedString } from '~/types/common';
import type { GoalItemWithId } from '~/types/store/pages/about-us/blocks/ourGoalsBlock';

const OurGoals = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.OUR_GOALS;

  const { block } = usePageBlock(pageId, blockId);

  const currentLocale: keyof LocalizedString = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);

  if (!block) return <Skeleton sx={{ height: '60px' }} />;

  const goalList: GoalItemWithId[] = ensureIds(block.goals);

  const goalPoints: SectionListItem[] = goalList.map((item) => ({
    id: item.id,
    title: item.title[currentLocale],
    description: proseToText(item.description[currentLocale])
  }));

  const handleTitleChange = (value: string) =>
    setField(pageId, blockId, 'title', { ...block.title, [currentLocale]: value });

  const handleChangeItem = (id: string, field: 'title' | 'description', value: string) => {
    const updatedList = goalList.map((item) => {
      if (item.id !== id) return item;

      const updatedFieldValue = field === 'description' ? textToProse(value) : value;

      return {
        ...item,
        [field]: {
          ...item[field],
          [currentLocale]: updatedFieldValue
        }
      };
    });

    setField(pageId, blockId, 'goals', updatedList);
  };

  const handleCreateItem = (): SectionListItem => {
    const newItem: GoalItemWithId = {
      id: crypto.randomUUID(),
      title: { uk: '', en: '' },
      description: { uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } }
    };
    setField(pageId, blockId, 'goals', [...goalList, newItem]);
    return { id: newItem.id, title: '', description: '' };
  };

  const handleDeleteItem = (id: string) =>
    setField(
      pageId,
      blockId,
      'goals',
      goalList.filter((item) => item.id !== id)
    );

  return (
    <CollapsibleBlock title="Наші цілі">
      <EditableSectionList
        title={block.title[currentLocale]}
        onTitleChange={handleTitleChange}
        items={goalPoints}
        onChangeItem={handleChangeItem}
        onCreateItem={handleCreateItem}
        onDeleteItem={handleDeleteItem}
        sectionLabel="Пункти секції:"
      />
    </CollapsibleBlock>
  );
};

export default OurGoals;
