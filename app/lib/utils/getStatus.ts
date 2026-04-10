import { formatDate } from './formatDate';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export function getStatus(status: string, createdAt?: string, updatedAt?: string, publishedAt?: string): string {
  if (status === BaseContentStatuses.Published) {
    if (updatedAt) {
      return `Редаговано ${formatDate(updatedAt)}`;
    }
    if (publishedAt) {
      return `Опубліковано ${formatDate(publishedAt)}`;
    }
    return 'Опубліковано';
  }
  if (status === BaseContentStatuses.Draft) {
    if (!createdAt) {
      return 'Чернетка';
    }

    return `Створено ${formatDate(createdAt)}`;
  }

  if (status === BaseContentStatuses.Editing) {
    return 'Редагування';
  }

  return '';
}
