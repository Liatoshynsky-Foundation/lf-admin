import type { BlockContentAdapter } from '~/shared/hooks/use-block-content/useBlockContent';
import { CONTENT_TYPE, type ContentItem } from '~/types/blocks/contentTypes';
import type { OurGoalsBlock } from '~/types/store/pages/about-us/blocks/ourGoalsBlock';

export const ourGoalsAdapter: BlockContentAdapter<OurGoalsBlock> = {
  toContent: (block) => [
    { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
    {
      id: 'goals',
      type: CONTENT_TYPE.SECTION_LIST,
      items: block.goals ?? [],
      label: 'Пункти секції:'
    }
  ],
  fromContent: (content) => {
    const byId = Object.fromEntries(content.map((item) => [item.id, item]));

    return {
      title: (byId.title as Extract<ContentItem, { type: 'header' }>)?.title,
      goals: (byId.goals as Extract<ContentItem, { type: 'section-list' }>)?.items
    };
  }
};
