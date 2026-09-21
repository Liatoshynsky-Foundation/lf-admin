import type { ContentTypeProps } from '../content-type.types';
import { isLocalizedJSON, normalizeLocalizedJSON } from '~/lib/utils/localizedJson';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import { useTitleValidation } from '~/shared/hooks/use-title-validation/useTitleValidation';
import type { HeaderContentItem } from '~/types/blocks/contentTypes';
import type { ProseDoc } from '~/types/common';

export const HeaderContent = ({ item, locale, onChange, pageId, blockId }: ContentTypeProps<HeaderContentItem>) => {
  const title = normalizeLocalizedJSON(item.title);
  const titleValidation = useTitleValidation(`${pageId}:${blockId}:title`, title[locale] as ProseDoc);
  const helper = isLocalizedJSON(item.helper) ? item.helper : undefined;

  return (
    <>
      <CustomTextField
        fieldType="formatting"
        title="Заголовок секції"
        label="Текст заголовку"
        value={title[locale]}
        onChange={(value) => onChange({ ...item, title: { ...title, [locale]: value } })}
        onBlur={titleValidation.onBlur}
        error={titleValidation.error}
        helperText={titleValidation.helperText}
      />
      {helper && (
        <CustomTextField
          fieldType="formatting"
          title="Допоміжний текст"
          label="Текст"
          value={helper[locale]}
          onChange={(value) => onChange({ ...item, helper: { ...helper, [locale]: value } })}
        />
      )}
    </>
  );
};
