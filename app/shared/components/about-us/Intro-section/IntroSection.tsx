'use client';
import { Box } from '@mui/material';

import CollapsibleBlock from '../../design-system/collapsible-block/CollapsibleBlock';
import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { QuoteBlock } from '../Liatoshynsky-office/quote-block/QuoteBlock';
import { styles } from './IntroSection.styles';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { CROP_RATIOS } from '~/constants/publications';
import { ImagePreviewBlock } from '~/ds-components/photo-block/PhotoBlock';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { mergeLocalizedValue } from '~/lib/utils/mergeLocalizedValue';
import { proseToHeaderText, resolveLocalizedText } from '~/lib/utils/prose';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { LocalizedString, ProseDoc } from '~/types/common';
import { getImageUrl } from '~/utils/getImageUrl';

export const IntroSection = () => {
  const pageId = PAGE_IDS.ABOUT_US;
  const blockId = BLOCK_IDS.INTRO_SECTION;

  const { block } = usePageBlock(pageId, blockId);

  const currentLocale: keyof LocalizedString = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);

  if (!block) return <EditBlockSkeleton />;

  const headerTitle = proseToHeaderText(block.title[currentLocale] as ProseDoc, 'Вступна секція');

  const imageAltText = resolveLocalizedText(block.image?.alt?.[currentLocale]);

  const handleImageAltChange = (val: string) => {
    setField(pageId, blockId, 'image', {
      ...block.image,
      alt: mergeLocalizedValue(block.image?.alt, currentLocale, val)
    });
  };


  return (
    <CollapsibleBlock title={headerTitle}>
      <CustomTextField
        fieldType="formatting"
        title="Заголовок сторінки"
        label="Текст заголовку"
        value={block.title[currentLocale]}
        onChange={(value) =>
          setField(pageId, blockId, 'title', {
            ...block.title,
            [currentLocale]: value
          })
        }
      />

      <Box sx={styles.imageWrapper}>
        <ImagePreviewBlock
          imageUrl={getImageUrl(block.image)}
          fileName={block.image.src || ''}
          initialCrop={block.image.crop}
          aspectRatio={CROP_RATIOS.HERO_BANNER}
          onChangeImage={(url: string, crop?: MediaModalResult['crop']) => {
            setField(pageId, blockId, 'image', {
              ...block.image,
              src: url,
              isTmp: false,
              crop: crop ?? null
            });
          }}
          showAlternativeText
          altText={imageAltText}
          onChangeAltText={(value) => handleImageAltChange(value)}
        />
      </Box>

      <CustomTextField
        fieldType="formatting"
        title="Підпис до зображення"
        label="Текст підпису"
        value={block.image.caption[currentLocale]}
        onChange={(value) =>
          setField(pageId, blockId, 'image', {
            ...block.image,
            caption: { ...block.image.caption, [currentLocale]: value },
            alt: { ...block.image.alt, [currentLocale]: value }
          })
        }
      />

      <Box sx={styles.quoteWrapper}>
        <QuoteBlock
          title={block.quote.source[currentLocale]}
          description={block.quote.text[currentLocale]}
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
  );
};
