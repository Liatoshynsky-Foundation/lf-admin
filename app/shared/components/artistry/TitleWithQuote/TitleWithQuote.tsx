'use client';
import { Box } from '@mui/material';

import { styles } from './TitleWithQuote.styles';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { QuoteBlock } from '~/shared/components/about-us/liatoshynsky-office/quote-block/QuoteBlock';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

export const TitleWithQuote = () => {
  const pageId = PAGE_IDS.ARTISTRY;
  const blockId = BLOCK_IDS.TITLE_WITH_QUOTE;

  const { block } = usePageBlock(pageId, blockId);

  const currentLocale = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);

  if (!block) return <EditBlockSkeleton />;

  return (
    <CollapsibleBlock title="Заголовок з цитатою">
      <CustomTextField
        fieldType="formatting"
        title="Головний заголовок"
        label="Текст заголовку"
        value={block.title[currentLocale]}
        onChange={(value) =>
          setField(pageId, blockId, 'title', {
            ...block.title,
            [currentLocale]: value
          })
        }
      />

      <Box sx={styles.quoteWrapper}>
        <QuoteBlock
          title={block.sourceText[currentLocale]}
          description={block.quoteText[currentLocale]}
          onTitleChange={(val) =>
            setField(pageId, blockId, 'sourceText', {
              ...block.sourceText,
              [currentLocale]: val
            })
          }
          onDescriptionChange={(val) =>
            setField(pageId, blockId, 'quoteText', {
              ...block.quoteText,
              [currentLocale]: val
            })
          }
        />
      </Box>
    </CollapsibleBlock>
  );
};
