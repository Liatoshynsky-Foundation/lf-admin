import type { BlockContentAdapter } from '~/shared/hooks/use-block-content/useBlockContent';
import { CONTENT_TYPE, type ContentItem } from '~/types/blocks/contentTypes';
import type { LocalizedJSON } from '~/types/common';
import type { LiatoshynskyOfficeBlock } from '~/types/store/pages/about-us/blocks/liatoshynskyOfficeBlock';

const emptyLocalizedJSON = (): LocalizedJSON => ({
  uk: { type: 'doc', content: [] },
  en: { type: 'doc', content: [] }
});

export const officeAdapter: BlockContentAdapter<LiatoshynskyOfficeBlock> = {
  toContent: (block) => [
    { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title ?? emptyLocalizedJSON() },
    {
      id: 'quote',
      type: CONTENT_TYPE.QUOTE,
      source: block.quote.source,
      text: block.quote.text
    }
  ],
  fromContent: (content) => {
    const byId = Object.fromEntries(content.map((item) => [item.id, item]));

    return {
      title: (byId.title as Extract<ContentItem, { type: 'header' }>)?.title,
      quote: {
        source: (byId.quote as Extract<ContentItem, { type: 'quote' }>)?.source,
        text: (byId.quote as Extract<ContentItem, { type: 'quote' }>)?.text
      }
    };
  }
};
