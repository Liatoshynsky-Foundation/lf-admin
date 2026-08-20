import type { ContentTypeProps } from '../content-type.types';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import type { ParagraphContentItem } from '~/types/blocks/contentTypes';

export const ParagraphContent = ({ item, locale, onChange }: ContentTypeProps<ParagraphContentItem>) => (
  <CustomTextField
    fieldType="formatting"
    title={item.label ?? 'Абзац'}
    label="Текст"
    value={item.value[locale]}
    onChange={(value) => onChange({ ...item, value: { ...item.value, [locale]: value } })}
  />
);
