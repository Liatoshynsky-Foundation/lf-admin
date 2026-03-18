import { News } from '~/domain/entities/News';
import { BaseRepository } from '~/src/infrastructure/repositories/baseRepository/baseRepository';
import { NewsStatus } from '~/types/enums/common.enums';

export type CreateNewsInput = Omit<News, 'id' | 'createdAt' | 'updatedAt' | 'meta'> & {
  meta?: Partial<News['meta']>;
};

export type UpdateNewsInput = Partial<Omit<News, 'id' | 'createdAt' | 'updatedAt'>>;

export type NewsFilters = {
  status?: NewsStatus;
  slug?: string;
  limit?: number;
  skip?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'newsDate';
  sortOrder?: 'asc' | 'desc';
};

export interface NewsRepository extends BaseRepository<News, NewsFilters> {
  create(input: CreateNewsInput): Promise<News>;
  incrementViews(id: string): Promise<News | null>;
}
