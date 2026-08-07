import type { ContentTypeProps } from '../ContentType.types';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import { useTitleValidation } from '~/shared/hooks/use-title-validation/useTitleValidation';
import type { HeaderContentItem } from '~/types/blocks/contentTypes';
import type { ProseDoc } from '~/types/common';

export const HeaderContent = ({ item, locale, onChange, pageId, blockId }: ContentTypeProps<HeaderContentItem>) => {
  const titleValidation = useTitleValidation(`${pageId}:${blockId}:title`, item.title[locale] as ProseDoc);

  return (
    <>
      <CustomTextField
        fieldType="formatting"
        title="Заголовок секції"
        label="Текст заголовку"
        value={item.title[locale]}
        onChange={(value) => onChange({ ...item, title: { ...item.title, [locale]: value } })}
        onBlur={titleValidation.onBlur}
        error={titleValidation.error}
        helperText={titleValidation.helperText}
      />
      {item.helper && (
        <CustomTextField
          fieldType="formatting"
          title="Допоміжний текст"
          label="Текст"
          value={item.helper[locale]}
          onChange={(value) => onChange({ ...item, helper: { ...item.helper!, [locale]: value } })}
        />
      )}
    </>
  );
};
