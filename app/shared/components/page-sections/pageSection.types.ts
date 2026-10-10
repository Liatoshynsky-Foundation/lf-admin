import type { LocalizedJSON } from '~/types/common';

export const SECTION_ITEM_TYPE = {
  SUBTITLE: 'subtitle',
  PARAGRAPH: 'paragraph',
  BULLET: 'bullet'
} as const;

export type SectionItemType = (typeof SECTION_ITEM_TYPE)[keyof typeof SECTION_ITEM_TYPE];

export interface SectionItem {
  id: string;
  type: SectionItemType;
  value: LocalizedJSON;
}

export interface PageSection {
  id: string;
  title: LocalizedJSON;
  items: SectionItem[];
}
