import { StatusWithDate } from './components/StatusWithDate';
import { type WorkStatus } from './works.mock';

export type TableGroupRowData = Readonly<{
  id: string;
  numberLabel: string;
  title: string;
  genre: string;
  startDate: string;
  endDate?: string;
  status: WorkStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  works: ReadonlyArray<{ id: string; title: string; year: string }>;
}>;

export type TableIndividualWorkData = Readonly<{
  id: string;
  title: string;
  year: string;
  genre: string;
  status: WorkStatus;
  updatedAt: string;
  language: 'uk' | 'en' | 'bilingual';
}>;

export type ColumnConfig = {
  id: string;
  headerLabel: string;
  width: string;
  hasRightDivider?: boolean;
  renderWork: (data: TableGroupRowData | TableIndividualWorkData) => React.ReactNode;
  renderSub?: (work: { id: string; title: string; year: string }) => React.ReactNode;
};

export const COLUMNS: readonly ColumnConfig[] = [
  {
    id: 'opus',
    headerLabel: 'Опуси',
    width: '88px',
    hasRightDivider: true,
    renderWork: (data) => ('numberLabel' in data ? data.numberLabel : ''),
    renderSub: () => null
  },
  {
    id: 'title',
    headerLabel: 'Назва',
    width: 'minmax(220px, 1fr)',
    renderWork: (data) => data.title,
    renderSub: (work) => work.title
  },
  {
    id: 'genre',
    headerLabel: 'Жанр',
    width: '216px',
    renderWork: (data) => ('genre' in data ? data.genre : ''),
    renderSub: () => null
  },
  {
    id: 'years',
    headerLabel: 'Роки',
    width: '96px',
    hasRightDivider: true,
    renderWork: (data) => {
      if ('startDate' in data) {
        return data.endDate && data.endDate !== data.startDate ? `${data.startDate} - ${data.endDate}` : data.startDate;
      }
      return data.year;
    },
    renderSub: () => null
  },
  {
    id: 'status',
    headerLabel: 'Статус',
    width: '48px',
    hasRightDivider: true,
    renderWork: (data) => {
      if ('status' in data) {
        return <StatusWithDate status={data.status} />;
      }
      return null;
    },
    renderSub: () => null
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
