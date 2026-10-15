import type { BlockContentAdapter } from '~/shared/hooks/use-block-content/useBlockContent';
import { CONTENT_TYPE, type ContentItem } from '~/types/blocks/contentTypes';
import type { LiatoshynskyOfficeBlock } from '~/types/store/pages/about-us/blocks/liatoshynskyOfficeBlock';

export const officeAdapter: BlockContentAdapter<LiatoshynskyOfficeBlock> = {
  toContent: (block) => [
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
      quote: {
        source: (byId.quote as Extract<ContentItem, { type: 'quote' }>)?.source,
        text: (byId.quote as Extract<ContentItem, { type: 'quote' }>)?.text
      }
    };
  }
};
