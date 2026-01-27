export enum ContentType {
  NEWS = 'news',
  EVENTS = 'events',
  MEDIA = 'media'
}

export interface BaseContentItem {
  id: string;
  title: string;
  description?: string;
  coverImage?: {
    src: string;
    alt: string;
  };
  createdAt: string;
  publishedAt?: string;
}

export interface NewsItem extends BaseContentItem {
  slug: string;
  status: string;
  newsDate?: string;
  views: number;
}

export interface EventItem extends BaseContentItem {
  eventDate: string;
  location?: string;
}

export interface MediaItem extends BaseContentItem {
  mediaType: 'image' | 'pdf' | 'audio';
  duration?: number;
}

export type ContentItem = NewsItem | EventItem | MediaItem;

export interface ContentGridProps {
  contentType: ContentType;
  limit?: number;
}

export interface UseContentDataResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
