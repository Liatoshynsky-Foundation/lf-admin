'use client';

import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Box } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import ConfigurableList from '../../configurable-list/ConfigurableList';
import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { SortableItemWrapper } from '../../sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '../../sortable-list/SortableList';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useSectionList } from '~/shared/hooks/use-section-list/useSectionList';
import { useStore } from '~/store';
import { LocalizedJSON } from '~/types/common';
import { DataWeCollectItemWithId } from '~/types/store/pages/privacy-policy';

export const DataWeCollect = () => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;
  const blockId = BLOCK_IDS.DATA_WE_COLLECT;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);

  const rawSections = block?.sections || [];
  const sectionsList: DataWeCollectItemWithId[] = ensureIds(rawSections);

  const { sections, addListPoint, removeListPoint, updateListPoint, updateSectionSubtitle, updateSectionList } = useSectionList({ blockId, pageId, sectionsList, currentLocale, setField });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {

      const sectionTarget = sections.find((section) => section.points.find((p) => p.id === active.id));
      
      if (!sectionTarget) return;

      const oldIndex = sectionTarget.points.findIndex((p) => p.id === active.id);
      const newIndex = sectionTarget.points.findIndex((p) => p.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(sectionTarget.points, oldIndex, newIndex);
        updateSectionList(sectionTarget.id, reordered);
      }
    }

  };
  if (!block) return <EditBlockSkeleton />;

  const handleChangeDescription = (value: JSONContent) => {
    setField(pageId, blockId, 'description', {
      ...block.description,
      [currentLocale]: value
    });
  };

  const handleChangeNote = (value: JSONContent) => {
    setField(pageId, blockId, 'note', {
      ...block.note,
      [currentLocale]: value
    });
  };

  return (
    <CollapsibleBlock title="Які дані ми збираємо та чому" grip>
      <CustomTextField
        fieldType="formatting"
        title="Вступний текст секції"
        value={block.description[currentLocale]}
        onChange={handleChangeDescription}
      />
      {
        sections.map((section, index) => (
          <Box key={section.id}>
            <CustomTextField
              fieldType="formatting"
              title={`Список ${index + 1}`}
              value={section.title}
              onChange={(value) => updateSectionSubtitle(section.id, value)}
            />
            <SortableList id="data-we-collect-list" items={section.points.map((p) => p.id)} onDragEnd={handleDragEnd}>
              <ConfigurableList<LocalizedJSON & {
                id: string;
              }>
                items={section.points}
                renderItem={({ item, onChange }) => (
                  <Box display="flex" flexDirection="column" gap="16px">
                    <SortableItemWrapper id={item.id} key={item.id} gripHandle gripPosition="top">
                      <CustomTextField
                        fieldType="formatting"
                        label="Текст пункту"
                        value={item?.[currentLocale] ?? { type: 'doc', content: [] }}
                        onChange={(value) => onChange({ ...item, [currentLocale]: value })}
                      />
                    </SortableItemWrapper>
                  </Box>
                )}
                addBtnLabel="Додати пункт"
                onChange={(value) => updateListPoint(section.id, value)}
                onCreate={() => addListPoint(section.id)}
                onDelete={(id) => removeListPoint(section.id, id)}
                editable
              />
            </SortableList>
          </Box>
        ))
      }

      <CustomTextField
        fieldType="formatting"
        title="Додаткова інформація"
        value={block.note[currentLocale]}
        onChange={handleChangeNote}
      />
    </CollapsibleBlock>
  );
};
