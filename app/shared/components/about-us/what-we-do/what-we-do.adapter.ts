import type { BlockContentAdapter } from '~/shared/hooks/use-block-content/useBlockContent';
import { CONTENT_TYPE, type ContentItem } from '~/types/blocks/contentTypes';
import type { WhatWeDoBlock } from '~/types/store/pages/about-us/blocks/whatWeDoBlock';

export const whatWeDoAdapter: BlockContentAdapter<WhatWeDoBlock> = {
  toContent: (block) => [
    { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
    {
      id: 'items',
      type: CONTENT_TYPE.SECTION_LIST,
      items: block.items ?? [],
      label: 'Пункти секції:'
    }
  ],
  fromContent: (content) => {
    const byId = Object.fromEntries(content.map((item) => [item.id, item]));

    return {
      title: (byId.title as Extract<ContentItem, { type: 'header' }>)?.title,
      items: (byId.items as Extract<ContentItem, { type: 'section-list' }>)?.items
    };
  }
};
