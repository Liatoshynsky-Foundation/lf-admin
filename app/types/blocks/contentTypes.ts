import type { LocalizedJSON } from '~/types/common';

export const CONTENT_TYPE = {
  HEADER: 'header',
  PARAGRAPH: 'paragraph',
  LIST: 'list',
  SECTION_LIST: 'section-list'
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

export interface SectionListEntry {
  id: string;
  title: LocalizedJSON;
  description: LocalizedJSON;
}

export interface SectionListContentItem extends BaseContentItem {
  type: 'section-list';
  items: SectionListEntry[];
  label?: string;
}

export type ContentItem =
  | HeaderContentItem
  | ParagraphContentItem
  | ListContentItem
  | SectionListContentItem;
