import { BasePage } from '~/domain/entities/Page';

export interface PageRepository {
  getPageBySlug(slug: string): Promise<BasePage | null>;
}
