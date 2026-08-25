import type { ImageType, LocalizedJSON } from '~/types/common';

export const CONTENT_TYPE = {
  HEADER: 'header',
  PARAGRAPH: 'paragraph',
  LIST: 'list',
  SECTION_LIST: 'section-list',
  QUOTE: 'quote',
  IMAGE: 'image'
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
  label?: string;
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

export interface QuoteContentItem extends BaseContentItem {
  type: 'quote';
  source: LocalizedJSON;
  text: LocalizedJSON;
}

export interface ImageContentItem extends BaseContentItem {
  type: 'image';
  value: ImageType;
  label?: string;
  aspectRatio?: number;
  showCaption?: boolean;
  previewWidth?: number;
  previewHeight?: number;
  alignActionsToPreviewBottom?: boolean;
}

export type ContentItem =
  | HeaderContentItem
  | ParagraphContentItem
  | ListContentItem
  | SectionListContentItem
  | QuoteContentItem
  | ImageContentItem;
