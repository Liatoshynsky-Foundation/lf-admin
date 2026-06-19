import { JSONContent } from '@tiptap/react';

import { PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import { PointsList } from '~/shared/components/privacy-policy/components/points-list/PointsList';
import { usePointsList } from '~/shared/hooks/use-points-list/usePointsList';
import { useSortableDragEnd } from '~/shared/hooks/use-sortable-drag-end/useSortableDragEnd';
import { useStore } from '~/store';
import { LocalizedJSON } from '~/types/common';
import { BlocksMap } from '~/types/store/pages';

export interface DescriptionListNoteStructure {
  description: LocalizedJSON;
  note: LocalizedJSON;
}

export type BlockWithDescriptionListNote = {
  [K in keyof BlocksMap]: BlocksMap[K] extends DescriptionListNoteStructure ? K : never;
}[keyof BlocksMap]

interface EditDescriptionListNoteBlockProps<T extends BlockWithDescriptionListNote> {
  blockId: T;
  block: BlocksMap[T] & DescriptionListNoteStructure;
  title: string;
  listFieldName: Extract<keyof BlocksMap[T], string>
}

export const EditDescriptionListNoteBlock = <T extends BlockWithDescriptionListNote>({
  blockId,
  title,
  listFieldName,
  block
}: EditDescriptionListNoteBlockProps<T>) => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;

  const currentLocale = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);

  const rawList = block[listFieldName] as Array<LocalizedJSON & { id?: string }>;
  const list = ensureIds(rawList);

  const { addPoint, removePoint, updatePoint, updateAllPoints, points } = usePointsList({
    list,
    setField,
    listFieldName,
    currentLocale,
    pageId,
    blockId
  });

  const { handleDragEnd } = useSortableDragEnd(points, (reordered) => {
    updateAllPoints(reordered);
  });

  const handleTextChange = (fieldName: 'description' | 'note', value: JSONContent) => {
    const currentValue = block[fieldName];
    setField(pageId, blockId, fieldName, {
      ...currentValue,
      [currentLocale]: value
    });
  };

  const descriptionBlock = block.description;
  const noteBlock = block.note;

  return (
    <CollapsibleBlock title={title} grip>
      {descriptionBlock && (
        <CustomTextField
          fieldType="formatting"
          title="Вступний текст секції"
          value={descriptionBlock[currentLocale]}
          onChange={(value) => handleTextChange('description', value)}
        />
      )}

      {points.length > 0 && (
        <PointsList
          id={blockId}
          points={points}
          addPoint={addPoint}
          removePoint={removePoint}
          updatePoint={updatePoint}
          onDragEnd={handleDragEnd}
        />
      )}

      {noteBlock && (
        <CustomTextField
          fieldType="formatting"
          title="Додаткова інформація"
          value={noteBlock[currentLocale]}
          onChange={(value) => handleTextChange('note', value)}
        />
      )}
    </CollapsibleBlock>
  );
};
