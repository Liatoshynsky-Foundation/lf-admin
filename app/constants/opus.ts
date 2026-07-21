import { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { OpusDetailsValue } from '~/types/opus';

export const OPUSES_BASE_PATH = '/creativity';
export const OPUS_GROUP_PATH = '/creativity/group';
export const OPUS_CREATE_PATH = `${OPUS_GROUP_PATH}/create`;

export const OPUS_PAGE_TITLES = {
  create: 'Створення опусу',
  edit: 'Редагування опусу',
  list: 'Опуси'
} as const;

export const OPUS_DETAILS_LABELS = {
  blockTitle: 'Деталі',
  numberKind: 'Назва',
  number: 'Номер',
  name: 'Назва опусу',
  additionalText: 'Примітка',
  creationYear: 'Рік створення',
  endYear: 'Рік закінчення',
  datesNote: 'Уточнення',
  genre: 'Жанр',
  compositions: 'Твори в опусі',
  addComposition: 'Додати'
} as const;

export const OPUS_NUMBER_KIND_OPTIONS = [
  { value: 'op', label: 'Op.' },
  { value: 'woo', label: 'B/o.' }
] as const;

export const OPUS_FIELD_LIMITS = {
  name: { min: 2, max: 250 },
  additionalText: 40,
  datesNote: 40,
  genre: 150
} as const;

export const OPUS_YEAR_RANGE = { min: 1900, max: 3000 } as const;

export const OPUS_VALIDATION_MESSAGES = {
  numberRequired: 'Вкажіть номер.',
  numberInvalid: 'Номер має бути цілим позитивним числом.',
  nameRequired: 'Введіть назву групи.',
  nameTooShort: 'Введіть щонайменше 2 символи.',
  creationYearRequired: 'Вкажіть рік складання.'
} as const;

export const COMPOSITION_MODAL_LABELS = {
  createTitle: 'Нова композиція',
  editTitle: 'Редагування композиції',
  name: 'Назва твору',
  genre: 'Жанр',
  year: 'Рік',
  audio: 'Аудіо',
  notes: 'Ноти',
  addAudio: 'Додати аудіо',
  addNotes: 'Додати ноти',
  audioName: 'Назва аудіо',
  notesName: 'Назва нот',
  notesNamePlaceholder: 'Введіть назву нот',
  publishDate: 'Дата видання',
  emptyFilesNotice:
    'Додайте файли для відкритого доступу. Якщо файли не додані, користувачі зможуть звʼязатися з вами.',
  cancel: 'Скасувати',
  create: 'Створити',
  save: 'Зберегти'
} as const;

export const COMPOSITION_SEARCH_LABELS = {
  createNew: 'Створити новий твір',
  noOptions: 'Нічого не знайдено'
} as const;

export const OPUS_DELETE_MODAL = {
  title: 'Підтвердити видалення',
  description: 'Ви збираєтесь видалити твір. Ви впевнені, що хочете продовжити?',
  confirm: 'Видалити',
  cancel: 'Скасувати'
} as const;

export const OPUS_FILE_DELETE_MODAL = {
  title: 'Підтвердити видалення',
  description: 'Ви збираєтесь видалити файл. Ви впевнені, що хочете продовжити?',
  confirm: 'Видалити',
  cancel: 'Скасувати'
} as const;

export const REQUIRED_FIELD_ERROR = 'Обовʼязкове поле';

export const OPUS_MUTATION_RESULTS = {
  created: 'Опус створено успішно',
  updated: 'Опус оновлено успішно',
  deleted: 'Опус видалено успішно'
} as const;

export const initialOpusDetails: OpusDetailsValue = {
  numberKind: 'op',
  number: '',
  name: '',
  additionalText: '',
  creationYear: '',
  endYear: '',
  datesNote: '',
  genre: '',
  compositions: []
};

export const initialOpusSeoValue: SeoBlockValue = {
  meta: {
    uk: { title: '', description: '', keywords: '' },
    en: { title: '', description: '', keywords: '' }
  },
  ogImage: null,
  allowIndexing: { uk: true, en: true }
};
