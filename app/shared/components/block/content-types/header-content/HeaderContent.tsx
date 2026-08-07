import type { ContentTypeProps } from '../ContentType.types';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import type { HeaderContentItem } from '~/types/blocks/contentTypes';

export const HeaderContent = ({ item, locale, onChange }: ContentTypeProps<HeaderContentItem>) => (
  <>
    <CustomTextField
      fieldType="formatting"
      title="Заголовок секції"
      label="Текст заголовку"
      value={item.title[locale]}
      onChange={(value) => onChange({ ...item, title: { ...item.title, [locale]: value } })}
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
