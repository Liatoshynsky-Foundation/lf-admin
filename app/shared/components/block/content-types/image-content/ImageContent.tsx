import { Box } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import type { ContentTypeProps } from '../content-type.types';
import { ImagePreviewBlock } from '~/ds-components/photo-block/PhotoBlock';
import { mergeLocalizedValue } from '~/lib/utils/mergeLocalizedValue';
import { resolveLocalizedText } from '~/lib/utils/prose';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import type { ImageContentItem } from '~/types/blocks/contentTypes';
import type { CropResult } from '~/types/common';
import { getImageUrl } from '~/utils/getImageUrl';

export const ImageContent = ({ item, locale, onChange }: ContentTypeProps<ImageContentItem>) => {
  const title = item.label ?? 'Зображення';
  const showCaption = item.showCaption ?? true;
  const imageAltText = resolveLocalizedText(item.value.alt?.[locale]);

  const handleImageChange = (url: string, crop?: CropResult | null) => {
    onChange({
      ...item,
      value: {
        ...item.value,
        src: url,
        crop: crop ?? null,
        isTmp: false
      } as ImageContentItem['value']
    });
  };

  const handleCaptionChange = (value: JSONContent) => {
    onChange({
      ...item,
      value: {
        ...item.value,
        caption: { ...item.value.caption, [locale]: value }
      }
    });
  };

  const handleAltChange = (val: string) => {
    onChange({
      ...item,
      value: {
        ...item.value,
        alt: mergeLocalizedValue(item.value.alt, locale, val)
      }
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <ImagePreviewBlock
        imageUrl={getImageUrl(item.value)}
        title={title}
        fileName={item.value.src || ''}
        initialCrop={item.value.crop}
        aspectRatio={item.aspectRatio}
        previewWidth={item.previewWidth}
        previewHeight={item.previewHeight}
        alignActionsToPreviewBottom={item.alignActionsToPreviewBottom}
        onChangeImage={handleImageChange}
        showAlternativeText
        altText={imageAltText}
        onChangeAltText={handleAltChange}
      />
      {showCaption && (
        <CustomTextField
          fieldType="formatting"
          title={`Підпис до зображення (${title})`}
          label="Підпис"
          value={item.value.caption[locale]}
          onChange={handleCaptionChange}
        />
      )}
    </Box>
  );
};
