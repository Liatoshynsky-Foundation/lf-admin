import type { BlockContentAdapter } from '~/shared/hooks/use-block-content/useBlockContent';
import { CONTENT_TYPE, type ContentItem } from '~/types/blocks/contentTypes';
import type { LocalizedJSON } from '~/types/common';

export type DescriptionListNoteBlock = {
  title: LocalizedJSON;
  description: LocalizedJSON;
  list: Array<{ id: string } & LocalizedJSON>;
  note: LocalizedJSON;
};

export const descriptionListNoteAdapter: BlockContentAdapter<DescriptionListNoteBlock> = {
  toContent: (block) => [
    { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
    { id: 'description', type: CONTENT_TYPE.PARAGRAPH, value: block.description, label: 'Вступний текст секції' },
    { id: 'list', type: CONTENT_TYPE.LIST, items: block.list ?? [] },
    { id: 'note', type: CONTENT_TYPE.PARAGRAPH, value: block.note, label: 'Додаткова інформація' }
  ],
  fromContent: (content) => {
    const byId = Object.fromEntries(content.map((i) => [i.id, i]));
    return {
      title: (byId.title as Extract<ContentItem, { type: 'header' }>)?.title,
      description: (byId.description as Extract<ContentItem, { type: 'paragraph' }>)?.value,
      list: (byId.list as Extract<ContentItem, { type: 'list' }>)?.items,
      note: (byId.note as Extract<ContentItem, { type: 'paragraph' }>)?.value
    };
  }
};
