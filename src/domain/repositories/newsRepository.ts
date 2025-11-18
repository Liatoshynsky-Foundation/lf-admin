import { News } from '~/domain/entities/News';
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

export interface NewsRepository {
  create(input: CreateNewsInput): Promise<News>;
  findById(id: string): Promise<News | null>;
  findBySlug(slug: string): Promise<News | null>;
  findAll(filters?: NewsFilters): Promise<News[]>;
  update(id: string, input: UpdateNewsInput): Promise<News | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: Omit<NewsFilters, 'limit' | 'skip' | 'sortBy' | 'sortOrder'>): Promise<number>;
  incrementViews(id: string): Promise<News | null>;
}
