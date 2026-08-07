import type { ContentTypeRenderer } from './ContentType.types';
import { HeaderContent } from './header-content/HeaderContent';
import { ListContent } from './list-content/ListContent';
import { ParagraphContent } from './paragraph-content/ParagraphContent';
import { QuoteContent } from './quote-content/QuoteContent';
import { SectionListContent } from './section-list-content/SectionListContent';
import { CONTENT_TYPE, type ContentTypeId } from '~/types/blocks/contentTypes';

export const CONTENT_TYPE_REGISTRY: Record<ContentTypeId, ContentTypeRenderer> = {
  [CONTENT_TYPE.HEADER]: HeaderContent as ContentTypeRenderer,
  [CONTENT_TYPE.PARAGRAPH]: ParagraphContent as ContentTypeRenderer,
  [CONTENT_TYPE.LIST]: ListContent as ContentTypeRenderer,
  [CONTENT_TYPE.SECTION_LIST]: SectionListContent as ContentTypeRenderer,
  [CONTENT_TYPE.QUOTE]: QuoteContent as ContentTypeRenderer
};
