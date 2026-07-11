export type ArchiveTabValue = 'all' | 'fonds' | 'cases';

export const ARCHIVE_PAGE_TITLE = 'Архів';
export const ARCHIVE_BASE_PATH = '/archive';

export const ARCHIVE_TABS = [
  { value: 'all', label: 'Всі', href: ARCHIVE_BASE_PATH },
  { value: 'fonds', label: 'Фонди', href: `${ARCHIVE_BASE_PATH}/fonds` },
  { value: 'cases', label: 'Справи', href: `${ARCHIVE_BASE_PATH}/cases` },
];