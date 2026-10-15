import type { ContentTypeProps } from '../content-type.types';
import { QuoteBlock } from '~/shared/components/about-us/liatoshynsky-office/quote-block/QuoteBlock';
import type { QuoteContentItem } from '~/types/blocks/contentTypes';

export const QuoteContent = ({ item, locale, onChange }: ContentTypeProps<QuoteContentItem>) => (
  <QuoteBlock
    title={item.text[locale]}
    description={item.source[locale]}
    onTitleChange={(value) => onChange({ ...item, text: { ...item.text, [locale]: value } })}
    onDescriptionChange={(value) => onChange({ ...item, source: { ...item.source, [locale]: value } })}
  />
);
