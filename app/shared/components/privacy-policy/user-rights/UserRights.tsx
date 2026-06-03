import { JSONContent } from '@tiptap/react';

import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { PointsList } from '../components/points-list/PointsList';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { usePointsList } from '~/shared/hooks/use-points-list/usePointsList';
import { useStore } from '~/store';

export const UserRights = () => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;
  const blockId = BLOCK_IDS.USER_RIGHTS;
  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((value)=>value.locale);
  const setField = useStore((value)=>value.setField);

  const rawList = block?.list || [];
  const list = ensureIds(rawList);
  
  const { addPoint, removePoint, updatePoint, points } = usePointsList({ 
    list, 
    setField, 
    currentLocale, 
    pageId, 
    blockId 
  });

  if (!block) return <EditBlockSkeleton />;

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
      {points.length > 0 && (
        <PointsList points={points} addPoint={addPoint} removePoint={removePoint} updatePoint={updatePoint} />
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