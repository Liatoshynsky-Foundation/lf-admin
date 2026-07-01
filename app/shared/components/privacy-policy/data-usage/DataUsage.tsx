'use client';

import { DragEndEvent } from '@dnd-kit/core';
import { JSONContent } from '@tiptap/react';

import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { PointsList } from '../components/points-list/PointsList';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { usePointsList } from '~/shared/hooks/use-points-list/usePointsList';
import { useStore } from '~/store';
import { DataUsageItemWithId } from '~/types/store/pages/privacy-policy';


export const DataUsage = () => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;
  const blockId = BLOCK_IDS.DATA_USAGE;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);

  const rawList = block?.list || [];
  const list: DataUsageItemWithId[] = ensureIds(rawList);

  const { addPoint, removePoint, updatePoint, updateAllPoints, points } = usePointsList({
    list,
    setField,
    currentLocale,
    pageId,
    blockId
  });

  const handleDragEnd = (event: DragEndEvent) => {
    handleSortableDragEnd(event, points, (reordered) => {
      updateAllPoints(reordered);
    });
  };

  if (!block) return <EditBlockSkeleton />;

  const handleChangeTitleText = (value: JSONContent) => {
    setField(pageId, blockId, 'title', {
      ...block.title,
      [currentLocale]: value
    });
  };

  return (
    <CollapsibleBlock title="Як ми використовуємо ваші дані" grip>
      <CustomTextField
        fieldType="formatting"
        title="Вступний текст секції"
        value={block.title[currentLocale]}
        onChange={(value) => handleChangeTitleText(value)}
      />

      {points.length > 0 && (
        <PointsList
          id="data-usage"
          points={points}
          addPoint={addPoint}
          removePoint={removePoint}
          updatePoint={updatePoint}
          onDragEnd={handleDragEnd}
        />
      )}

    </CollapsibleBlock>
  );
};