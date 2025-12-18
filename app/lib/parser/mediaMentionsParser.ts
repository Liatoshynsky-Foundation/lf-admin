import { MediaMentionEntityRaw } from '~/domain/entities/MediaMentions';

export async function parseMediaMention(url: string): Promise<Omit<MediaMentionEntityRaw, 'status' | 'slug'>> {
  return {
    url,
    title: 'Sample Title',
    description: 'Sample Description',
    coverImageUrl: 'https://example.com/cover.jpg',
    publishedAt: new Date(),
    meta: {
      views: 0
    }
  };
}
