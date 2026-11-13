import type { BlockContentAdapter } from '~/shared/hooks/use-block-content/useBlockContent';
import { CONTENT_TYPE, type ContentItem } from '~/types/blocks/contentTypes';
import type { DataUsageBlock } from '~/types/store/pages/privacy-policy';

export const dataUsageAdapter: BlockContentAdapter<DataUsageBlock> = {
  toContent: (block) => [
    { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
    { id: 'description', type: CONTENT_TYPE.PARAGRAPH, value: block.description, label: 'Вступний текст секції' },
    { id: 'list', type: CONTENT_TYPE.LIST, items: block.list ?? [] }
  ],
  fromContent: (content) => {
    const header = content.find((i): i is Extract<ContentItem, { type: 'header' }> => i.type === 'header');
    const description = content.find((i): i is Extract<ContentItem, { type: 'paragraph' }> => i.type === 'paragraph');
    const list = content.find((i): i is Extract<ContentItem, { type: 'list' }> => i.type === 'list');

    return {
      ...(header && { title: header.title }),
      ...(description && { description: description.value }),
      ...(list && { list: list.items })
    };
  }
};
