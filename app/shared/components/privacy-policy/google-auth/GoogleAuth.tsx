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
import { ConfigurableListItem } from '~/types/accordionBlocks';

export type GoogleAuthPoint = ConfigurableListItem & { value: JSONContent };

export const GoogleAuth = () => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;
  const blockId = BLOCK_IDS.GOOGLE_AUTH;
  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);
  const rawList = block?.list || [];
  const list = ensureIds(rawList);
  
  const { addPoint, removePoint, updatePoint, points: googleAuthPoints } = usePointsList({ 
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
    <CollapsibleBlock title="Авторизація через Google-акаунт">
      <CustomTextField
        fieldType="formatting"
        title="Вступний текст секції"
        value={block.description[currentLocale]}
        onChange={(value) => handleChangeTitleText(value)}
      />

      {googleAuthPoints.length > 0 && (
        <PointsList points={googleAuthPoints} addPoint={addPoint} removePoint={removePoint} updatePoint={updatePoint} />
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