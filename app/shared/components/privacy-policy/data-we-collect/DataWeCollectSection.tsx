'use client';

import { Box } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import ConfigurableList from '../../configurable-list/ConfigurableList';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { SortableItemWrapper } from '../../sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '../../sortable-list/SortableList';
import { useSortableDragEnd } from '~/shared/hooks/use-sortable-drag-end/useSortableDragEnd';
import { LocalizedJSON } from '~/types/common';

export interface DataWeCollectSectionProps {
  section: {
    id: string;
    title: JSONContent;
    points: Array<LocalizedJSON & {
      id: string;
    }>;
  };
  listTitle: string;
  currentLocale: 'uk' | 'en';
  updateSectionSubtitle: (sectionId: string, value: JSONContent) => void;
  updateSectionList: (sectionId: string, newPoints: Array<LocalizedJSON & { id: string }>) => void;
  updateListPoint: (id: string, newValue: LocalizedJSON & { id: string }) => void;
  addListPoint: (sectionId: string) => void;
  removeListPoint: (sectionId: string, pointId: string) => void;
}

export const DataWeCollectSection = ({
  section,
  listTitle,
  currentLocale,
  updateSectionSubtitle,
  updateSectionList,
  updateListPoint,
  addListPoint,
  removeListPoint,
}: DataWeCollectSectionProps) => {
  const { handleDragEnd } = useSortableDragEnd(section.points, (reordered) => {
    updateSectionList(section.id, reordered);
  });

  return (
    <>
      <CustomTextField
        fieldType="formatting"
        title={listTitle}
        value={section.title}
        onChange={(value) => updateSectionSubtitle(section.id, value)}
      />
      <SortableList id={`${listTitle}-data-we-collect-list`} items={section.points.map((p) => p.id)} onDragEnd={handleDragEnd}>
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
    </>
  );
};
