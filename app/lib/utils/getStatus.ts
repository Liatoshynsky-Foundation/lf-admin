import { formatDate } from './formatDate';

export function getStatus(status: string, createdAt: string, updatedAt?: string, publishedAt?: string): string {
  if (status === 'published') {
    if (updatedAt) {
      return `Редаговано ${formatDate(updatedAt)}`;
    }
    if (publishedAt) {
      return `Опубліковано ${formatDate(publishedAt)}`;
    }
    return 'Опубліковано';
  }
  if (status === 'draft') {
    return `Створено ${formatDate(createdAt)}`;
  }

  return '';
}
