import { HeaderConfig } from '~/shared/components/table-layout/TableHeader';

export const COLUMNS: readonly HeaderConfig[] = [
  {
    id: 'opus',
    headerLabel: 'Опуси',
    width: '88px',
    hasRightDivider: true
  },
  {
    id: 'title',
    headerLabel: 'Назва',
    width: 'minmax(220px, 1fr)'
  },
  {
    id: 'genre',
    headerLabel: 'Жанр',
    width: '216px'
  },
  {
    id: 'years',
    headerLabel: 'Роки',
    width: '96px',
    hasRightDivider: true
  },
  {
    id: 'status',
    headerLabel: 'Статус',
    width: '48px',
    hasRightDivider: true,
    align: 'center'
  }
];

export const GROUP_MENU_ITEMS = [
  { id: 'edit', label: 'Редагувати' },
  { id: 'publish', label: 'Опублікувати' },
  { id: 'unpublish', label: 'Зняти з публікації' },
  { id: 'ungroup', label: 'Розгрупувати' },
  { id: 'seo', label: 'SEO налаштування' },
  { id: 'share', label: 'Поширити' },
  { id: 'delete', label: 'Видалити', danger: true }
] as const;

export const WORK_MENU_ITEMS = [
  { id: 'upload_audio', label: 'Завантажити аудіо' },
  { id: 'upload_pdf', label: 'Завантажити PDF' },
  { id: 'seo', label: 'SEO налаштування' },
  { id: 'share', label: 'Поширити' },
  { id: 'delete', label: 'Видалити', danger: true }
] as const;
