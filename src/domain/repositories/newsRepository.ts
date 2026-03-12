import { News } from '~/domain/entities/News';
import {FiltersInput, IBaseRepository} from '~/domain/repositories/baseRepository';
import {NewsStatus} from '~/types/enums/common.enums';

export type CreateNewsInput = Omit<News, 'id' | 'createdAt' | 'updatedAt' | 'meta'> & {
  meta?: Partial<News['meta']>;
};

export type UpdateNewsInput = Partial<Omit<News, 'id' | 'createdAt' | 'updatedAt'>> & {
  slug?: string;
};

export type NewsFilters = FiltersInput & {
  status?: NewsStatus;
};

export interface NewsRepository extends IBaseRepository<News, NewsFilters> {
  create(input: CreateNewsInput): Promise<News>;
  incrementViews(id: string): Promise<News | null>;
}
