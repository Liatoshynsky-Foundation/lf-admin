'use client';

import { Box } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import ConfigurableList from '../../configurable-list/ConfigurableList';
import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { LocalizedJSON } from '~/types/common';
import { DataWeCollectItemWithId } from '~/types/store/pages/privacy-policy';


export const DataWeCollect = () => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;
  const blockId = BLOCK_IDS.DATA_WE_COLLECT;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);

  if (!block) return <EditBlockSkeleton />;

  const sectionsList: DataWeCollectItemWithId[] = ensureIds(block.sections);

  const emptyDoc: JSONContent = { type: 'doc', content: [] };

  const sections = sectionsList.map((item) => ({
    id: item.id,
    title: item.subtitle[currentLocale],
    points: ensureIds(item.list)
  }));

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

  const handleChangeSectionSubtitle = (sectionId: string, value: JSONContent) => {
    const updatedSections = sectionsList.map((section) =>
      section.id === sectionId
        ? { ...section, subtitle: { ...section.subtitle, [currentLocale]: value } }
        : section
    );
    setField(pageId, blockId, 'sections', updatedSections);
  };

  const handleUpdateSectionList = (sectionId: string, newPoints: {
    id: string;
    uk: JSONContent;
    en: JSONContent;
  }[]) => {
    const updatedSection = sectionsList.find((s)=> s.id === sectionId);

    if(!updatedSection) return;

    const newSections = sectionsList.map((section)=>
      section.id === sectionId ? {...section, list: newPoints} : section);

    setField(pageId, blockId, 'sections', newSections);

  };


  const handleChangeSectionListPoint = (sectionId: string, updatedPoint: {
    id: string;
    uk: JSONContent;
    en: JSONContent;
  }) => {
    const currentSection = sections.find(s => s.id === sectionId);

    if (!currentSection) return;
    const currentPoints = currentSection.points;
    const newPoints = currentPoints.map((p) => 
      p.id === updatedPoint.id ? updatedPoint : p
    );
    handleUpdateSectionList(sectionId, newPoints);
  };


  const handleAddSectionListPoint = (sectionId: string) => {
    const currentSection = sections.find(s => s.id === sectionId) ;

    const currentPoints = currentSection?.points || [];
    const newPoint = { id: crypto.randomUUID(), uk: emptyDoc, en: emptyDoc };
    const newPoints = [...currentPoints, newPoint];

    handleUpdateSectionList(sectionId, newPoints);

    return newPoint;
  };


  const handleDeleteSectionListPoint = (sectionId: string, pointId: string) => {
    const currentSection = sections.find(s => s.id === sectionId);

    if (!currentSection) return;

    const currentPoints = currentSection.points;
    const newPoints = currentPoints.filter((point) => point.id !== pointId);

    handleUpdateSectionList(sectionId, newPoints);
  };


  return (
    <CollapsibleBlock title="Які дані ми збираємо та чому">
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
              onChange={(value) => handleChangeSectionSubtitle(section.id, value)}
            />
            <ConfigurableList<LocalizedJSON & {
              id: string;
            }>
              items={section.points}
              renderItem={({ item, onChange }) => (
                <Box display="flex" flexDirection="column" gap="16px">
                  <CustomTextField
                    fieldType="formatting"
                    label="Текст пункту"
                    value={item[currentLocale]}
                    onChange={(value) => onChange({ ...item, [currentLocale]: value })}
                  />
                </Box>
              )}
              addBtnLabel="Додати пункт"
              onChange={(value) => handleChangeSectionListPoint(section.id, value)}
              onCreate={() => handleAddSectionListPoint(section.id)}
              onDelete={(id) => handleDeleteSectionListPoint(section.id, id)}
              editable
            />
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
