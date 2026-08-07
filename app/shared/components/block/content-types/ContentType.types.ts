import type { ContentItem } from '~/types/blocks/contentTypes';

export interface ContentTypeProps<T extends ContentItem = ContentItem> {
  item: T;
  locale: 'uk' | 'en';
  onChange: (next: T) => void;
}

export type ContentTypeRenderer<T extends ContentItem = ContentItem> = React.ComponentType<ContentTypeProps<T>>;
