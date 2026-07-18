'use client';

import { Box } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { DataWeCollectSection } from './DataWeCollectSection';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import { proseToHeaderText } from '~/lib/utils/prose';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useSectionList } from '~/shared/hooks/use-section-list/useSectionList';
import { useStore } from '~/store';
import { ProseDoc } from '~/types/common';
import { DataWeCollectItemWithId } from '~/types/store/pages/privacy-policy';

export const DataWeCollect = () => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;
  const blockId = BLOCK_IDS.DATA_WE_COLLECT;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);
  const toggleBlockVisibility = useStore((state) => state.toggleBlockVisibility);

  const rawSections = block?.sections || [];
  const sectionsList: DataWeCollectItemWithId[] = ensureIds(rawSections);

  const { sections, addListPoint, removeListPoint, updateListPoint, updateSectionSubtitle, updateSectionList } = useSectionList({ blockId, pageId, sectionsList, currentLocale, setField });

  if (!block) return <EditBlockSkeleton />;

  const handleChangeTitle = (value: JSONContent) => {
    setField(pageId, blockId, 'title', {
      ...block.title,
      [currentLocale]: value
    });
  };

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

  const headerTitle = proseToHeaderText(block.title?.[currentLocale] as ProseDoc, 'Які дані ми збираємо та чому');

  return (
    <CollapsibleBlock
      title={headerTitle}
      grip
      hidden={block.hidden}
      onToggleVisibility={() => toggleBlockVisibility(pageId, blockId)}
    >
      <CustomTextField
        fieldType="formatting"
        title="Заголовок секції"
        label="Текст заголовку"
        value={block.title?.[currentLocale]}
        onChange={handleChangeTitle}
      />

      <CustomTextField
        fieldType="formatting"
        title="Вступний текст секції"
        value={block.description[currentLocale]}
        onChange={handleChangeDescription}
      />
      {
        sections.map((section, index) => (
          <Box key={section.id}>
            <DataWeCollectSection
              section={section}
              listTitle={`Список ${index + 1}`}
              currentLocale={currentLocale}
              updateSectionSubtitle={updateSectionSubtitle}
              updateSectionList={updateSectionList}
              updateListPoint={updateListPoint}
              addListPoint={addListPoint}
              removeListPoint={removeListPoint}
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
