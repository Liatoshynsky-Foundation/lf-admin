'use client';

import { Box } from '@mui/material';

import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { useBlockFieldHandlers } from '~/shared/hooks/use-block-field-handlers/useBlockFieldHandlers';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

export const PublicationsIntro = () => {
  const pageId = PAGE_IDS.PUBLICATIONS;
  const blockId = BLOCK_IDS.PUBLICATIONS_INTRO;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale) as 'uk' | 'en';

  const { handleLocalizedContentChange } = useBlockFieldHandlers(pageId, blockId, currentLocale, block);

  if (!block) return <EditBlockSkeleton />;

  return (
    <CollapsibleBlock title="Вступний текст">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <CustomTextField
          fieldType="formatting"
          label="Перший абзац"
          value={block.publicationsIntro[currentLocale] ?? undefined}
          onChange={handleLocalizedContentChange('publicationsIntro')}
        />

        <CustomTextField
          fieldType="formatting"
          label="Другий абзац"
          value={block.publicationsOutro[currentLocale] ?? undefined}
          onChange={handleLocalizedContentChange('publicationsOutro')}
        />
      </Box>
    </CollapsibleBlock>
  );
};
