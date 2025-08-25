'use client';
import { Box, Skeleton } from '@mui/material';

import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { ImagePreviewBlock } from '../../design-system/photo-block/PhotoBlock';
import { CustomTextField } from '../../design-system/text-field/TextField';
import { QuoteBlock } from '../Liatoshynsky-office/quote-block/QuoteBlock';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { usePageBlocks } from '~/shared/hooks/use-page-blocks/usePageBlocks';
import { useStore } from '~/store';
import { LocalizedString } from '~/types/common';
import { IntroSectionBlock } from '~/types/store/pages/about-us';

export const EntrySection = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.INTRO_SECTION;

  const { blocks } = usePageBlocks(pageId);

  const currentLocale: keyof LocalizedString = useStore((state) => state.locale);

  const setField = useStore((state) => state.setField);
  const block: IntroSectionBlock | undefined = blocks.IntroSection;
  if (!block) return <Skeleton sx={{ height: '60px' }} />;

  return (
    <>
      {block && (
        <CollapsibleBlock title="Вступна секція">
          <CustomTextField
            title="Заголовок сторінки"
            label="Текст заголовку"
            fullWidth
            value={block.title[currentLocale] || ''}
            onChange={(e) =>
              setField(pageId, blockId, 'title', {
                ...block.title,
                [currentLocale]: e.target.value
              })
            }
          />

          <Box sx={{ marginLeft: '-16px', marginTop: '15px' }}>
            <ImagePreviewBlock
              imageUrl={`/images/${block.image.src}.png`}
              fileName={block.image.src || ''}
              cropHeight={50}
              cropWidth={50}
              onChangeImage={(file) =>
                setField(pageId, blockId, 'image', {
                  ...block.image,
                  src: file.name,
                  generatedSrc: `/api/blob-url?folderName=photos&blobName=${file.name}`
                })
              }
            />
          </Box>

          <CustomTextField
            title="Підпис до зображення"
            label="Текст підпису"
            fullWidth
            value={block.image.caption[currentLocale] || ''}
            onChange={(e) =>
              setField(pageId, blockId, 'image', {
                ...block.image,
                caption: { ...block.image.caption, [currentLocale]: e.target.value }
              })
            }
          />

          <Box sx={{ marginTop: '15px' }}>
            <QuoteBlock
              title={block.quote.source[currentLocale] || ''}
              description={block.quote.text[currentLocale] || ''}
              onTitleChange={(val) =>
                setField(pageId, blockId, 'quote', {
                  source: { ...block?.quote?.source, [currentLocale]: val },
                  text: block.quote.text
                })
              }
              onDescriptionChange={(val) =>
                setField(pageId, blockId, 'quote', {
                  source: block.quote.source,
                  text: { ...block.quote.text, [currentLocale]: val }
                })
              }
            />
          </Box>
        </CollapsibleBlock>
      )}
    </>
  );
};
