import { Box } from '@mui/material';
import { JSONContent } from '@tiptap/react';

import type { ContentTypeProps } from '../ContentType.types';
import { ImagePreviewBlock } from '~/ds-components/photo-block/PhotoBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import type { ImageContentItem } from '~/types/blocks/contentTypes';
import type { CropResult } from '~/types/common';
import { getImageUrl } from '~/utils/getImageUrl';

export const ImageContent = ({ item, locale, onChange }: ContentTypeProps<ImageContentItem>) => {
  const title = item.label ?? 'Зображення';
  const showCaption = item.showCaption ?? true;

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

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <ImagePreviewBlock
        imageUrl={getImageUrl(item.value)}
        title={title}
        fileName={item.value.src || ''}
        initialCrop={item.value.crop}
        aspectRatio={item.aspectRatio}
        onChangeImage={handleImageChange}
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
