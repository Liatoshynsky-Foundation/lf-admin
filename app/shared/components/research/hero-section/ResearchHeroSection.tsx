'use client';

import { Box, Typography } from '@mui/material';

import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

interface EditorTextNode {
  text?: string;
}

interface EditorParagraphNode {
  content?: EditorTextNode[];
}

interface EditorDocument {
  content?: EditorParagraphNode[];
}

const toPlainText = (editorValue: unknown): string => {
  if (typeof editorValue === 'string') {
    return editorValue;
  }

  if (!editorValue || typeof editorValue !== 'object') {
    return '';
  }

  if ('content' in editorValue) {
    const documentNode = editorValue as EditorDocument;

    const paragraphLines =
      documentNode.content?.map((paragraph) => {
        const wordsInParagraph = paragraph.content?.map((textNode) => textNode.text ?? '') ?? [];
        return wordsInParagraph.join('');
      }) ?? [];

    return paragraphLines.join('\n');
  }

  return '';
};

export const ResearchHeroSection = () => {
  const pageId = PAGE_IDS.RESEARCH;
  const blockId = BLOCK_IDS.RESEARCH_HERO;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale) as 'uk' | 'en';
  const setField = useStore((state) => state.setField);

  if (!block) return <EditBlockSkeleton />;

  const titleData = block.title;
  const rawReturnedTitle =
    typeof titleData === 'string' ? titleData : (titleData as Record<'uk' | 'en', string> | undefined)?.[currentLocale];
  const displayTitle = rawReturnedTitle || 'Дослідження та наукові праці';

  return (
    <CollapsibleBlock title="Цитата">
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
          Заголовок сторінки
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {displayTitle}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <CustomTextField
          key={`research-quote-text-${currentLocale}`}
          fieldType="formatting"
          label="Цитата"
          value={block.quote?.text?.[currentLocale] ?? undefined}
          onChange={(val) => {
            setField(pageId, blockId, 'quote', {
              ...block.quote,
              text: {
                ...block.quote?.text,
                [currentLocale]: toPlainText(val)
              }
            });
          }}
        />

        <CustomTextField
          key={`research-quote-source-${currentLocale}`}
          fieldType="formatting"
          label="Підпис до цитати"
          value={block.quote?.source?.[currentLocale] ?? undefined}
          onChange={(val) => {
            setField(pageId, blockId, 'quote', {
              ...block.quote,
              source: {
                ...block.quote?.source,
                [currentLocale]: toPlainText(val)
              }
            });
          }}
        />
      </Box>
    </CollapsibleBlock>
  );
};
