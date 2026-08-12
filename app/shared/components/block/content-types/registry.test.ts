import { HeaderContent } from './header-content/HeaderContent';
import { ImageContent } from './image-content/ImageContent';
import { ListContent } from './list-content/ListContent';
import { ParagraphContent } from './paragraph-content/ParagraphContent';
import { QuoteContent } from './quote-content/QuoteContent';
import { CONTENT_TYPE_REGISTRY } from './registry';
import { SectionListContent } from './section-list-content/SectionListContent';
import { CONTENT_TYPE } from '~/types/blocks/contentTypes';

describe('CONTENT_TYPE_REGISTRY', () => {
  it('should map every content type to its renderer', () => {
    expect(CONTENT_TYPE_REGISTRY).toEqual({
      [CONTENT_TYPE.HEADER]: HeaderContent,
      [CONTENT_TYPE.PARAGRAPH]: ParagraphContent,
      [CONTENT_TYPE.LIST]: ListContent,
      [CONTENT_TYPE.SECTION_LIST]: SectionListContent,
      [CONTENT_TYPE.QUOTE]: QuoteContent,
      [CONTENT_TYPE.IMAGE]: ImageContent
    });
  });
});
