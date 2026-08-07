import type { LocalizedJSON } from '~/types/common';

export const CONTENT_TYPE = {
  HEADER: 'header',
  PARAGRAPH: 'paragraph',
  LIST: 'list'
} as const;

export type ContentTypeId = (typeof CONTENT_TYPE)[keyof typeof CONTENT_TYPE];

interface BaseContentItem {
  id: string;
  type: ContentTypeId;
}

export interface HeaderContentItem extends BaseContentItem {
  type: 'header';
  title: LocalizedJSON;
  helper?: LocalizedJSON;
}

export interface ParagraphContentItem extends BaseContentItem {
  type: 'paragraph';
  value: LocalizedJSON;
  label?: string;
}

export interface ListContentItem extends BaseContentItem {
  type: 'list';
  items: Array<{ id: string } & LocalizedJSON>;
}

export type ContentItem = HeaderContentItem | ParagraphContentItem | ListContentItem;
