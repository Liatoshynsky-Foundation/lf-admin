import { BaseContentStatuses } from '~/types/enums/common.enums';

export type WorkStatus = typeof BaseContentStatuses[keyof typeof BaseContentStatuses];
type WorkLanguage = 'uk' | 'en' | 'bilingual';

export type WorkItem = {
  id: string;
  title: string;
  year: string;
  status?: WorkStatus;
  updatedAt?: string;
  createdAt?: string;
  publishedAt?: string;
};

type WorkGroupBase = {
  id: string;
  title: string;
  genre: string;
  language: WorkLanguage;
  yearRange: string;
  status: WorkStatus;
  updatedAt: string;
  works: WorkItem[];
};

export type OpusGroup = WorkGroupBase & {
  opusNumber: string;
};

export type UngroupedGroup = WorkGroupBase & {
  boNumber: string;
};

export type WorksMockData = {
  opusGroups: OpusGroup[];
  ungroupedGroups: UngroupedGroup[];
};

type WorkSeed = Readonly<[id: string, title: string, year: string]>;

type GroupSeed<TNumberKey extends 'opusNumber' | 'boNumber'> = Readonly<{
  id: string;
  number: string;
  title: string;
  genre: string;
  language: WorkLanguage;
  yearRange: string;
  status: WorkStatus;
  updatedAt: string;
  works: ReadonlyArray<WorkSeed>;
  numberKey: TNumberKey;
}>;

const buildWorks = (works: ReadonlyArray<WorkSeed>): WorkItem[] =>
  works.map(([id, title, year]) => ({ id, title, year }));

const buildGroup = <TNumberKey extends 'opusNumber' | 'boNumber'>(
  seed: GroupSeed<TNumberKey>
): WorkGroupBase & Record<TNumberKey, string> => ({
  id: seed.id,
  [seed.numberKey]: seed.number,
  title: seed.title,
  genre: seed.genre,
  language: seed.language,
  yearRange: seed.yearRange,
  status: seed.status,
  updatedAt: seed.updatedAt,
  works: buildWorks(seed.works)
}) as WorkGroupBase & Record<TNumberKey, string>;

const OPUS_GROUP_SEEDS: ReadonlyArray<GroupSeed<'opusNumber'>> = [
  {
    id: 'opus-1',
    numberKey: 'opusNumber',
    number: 'op. 1',
    title: 'Перший струнний квартет (d moll)',
    genre: 'Струнний квартет',
    language: 'uk',
    yearRange: '1920-1930',
    status: BaseContentStatuses.Published,
    updatedAt: '2025-09-11T00:00:00.000Z',
    works: [
      ['work-1-1', '№1«Після бою», сл. І. Буніна, укр.пер. М. Стріхи', '1922'],
      ['work-1-2', '№3«Був цар», сл. Г. Гейне, укр. пер. М. Стріхи', '1922'],
      ['work-1-3', '№3«Був цар», сл. Г. Гейне, укр. пер. М. Стріхи', '1922']
    ]
  },
  {
    id: 'opus-2',
    numberKey: 'opusNumber',
    number: 'op. 2',
    title: 'Опус 2',
    genre: 'Романс, мистецька пісня',
    language: 'uk',
    yearRange: '1930-1940',
    status: BaseContentStatuses.Draft,
    updatedAt: '2025-09-11T00:00:00.000Z',
    works: [
      ['work-2-1', '№1 «Туман над полем»', '1931'],
      ['work-2-2', '№2 «Весняний мотив»', '1934']
    ]
  },
  {
    id: 'opus-3',
    numberKey: 'opusNumber',
    number: 'op. 3',
    title: 'Опус 3',
    genre: 'Романс, мистецька пісня',
    language: 'bilingual',
    yearRange: '1922',
    status: BaseContentStatuses.Draft,
    updatedAt: '2025-09-11T00:00:00.000Z',
    works: [['work-3-1', '№1 «Ноктюрн»', '1922']]
  },
  {
    id: 'opus-4',
    numberKey: 'opusNumber',
    number: 'op. 4',
    title: 'Три романси на вірші Т. Шевченка',
    genre: 'Романс, мистецька пісня',
    language: 'uk',
    yearRange: '1923-1924',
    status: BaseContentStatuses.Editing,
    updatedAt: '2025-09-13T00:00:00.000Z',
    works: [
      ['work-4-1', '№1 «Думи мої»', '1923'],
      ['work-4-2', '№2 «Минають дні»', '1924']
    ]
  },
  {
    id: 'opus-5',
    numberKey: 'opusNumber',
    number: 'op. 5',
    title: 'Соната для фортепіано №1',
    genre: 'Соната',
    language: 'en',
    yearRange: '1925',
    status: BaseContentStatuses.Published,
    updatedAt: '2025-09-10T00:00:00.000Z',
    works: [
      ['work-5-1', 'I. Allegro moderato', '1925'],
      ['work-5-2', 'II. Largo', '1925'],
      ['work-5-3', 'III. Finale', '1925']
    ]
  },
  {
    id: 'opus-6',
    numberKey: 'opusNumber',
    number: 'op. 6',
    title: 'Симфонічна сюїта',
    genre: 'Симфонія',
    language: 'uk',
    yearRange: '1926-1927',
    status: BaseContentStatuses.Draft,
    updatedAt: '2025-09-09T00:00:00.000Z',
    works: [
      ['work-6-1', 'I. Прелюдія', '1926'],
      ['work-6-2', 'II. Intermezzo', '1927']
    ]
  }
];

const UNGROUPED_GROUP_SEEDS: ReadonlyArray<GroupSeed<'boNumber'>> = [
  {
    id: 'bo-1',
    numberKey: 'boNumber',
    number: 'bo. 1',
    title: 'Перший струнний квартет (d moll)',
    genre: 'Струнний квартет',
    language: 'uk',
    yearRange: '1922',
    status: BaseContentStatuses.Published,
    updatedAt: '2025-09-11T00:00:00.000Z',
    works: [
      ['bo-work-1-1', '№1«Після бою», сл. І. Буніна, укр.пер. М. Стріхи', '1922'],
      ['bo-work-1-2', '№2«Смерть», сл. І. Буніна, укр.пер. М. Стріхи', '1922'],
      ['bo-work-1-3', '№3«Був цар», сл. Г. Гейне, укр. пер. М. Стріхи', '1922']
    ]
  },
  {
    id: 'bo-2',
    numberKey: 'boNumber',
    number: 'bo. 2',
    title: 'Опус 2',
    genre: 'Романс, мистецька пісня',
    language: 'uk',
    yearRange: '1922',
    status: BaseContentStatuses.Draft,
    updatedAt: '2025-09-11T00:00:00.000Z',
    works: [
      ['bo-work-2-1', 'Пісня №1', '1922'],
      ['bo-work-2-2', 'Пісня №3 «Дорога додому»', '1932']
    ]
  },
  {
    id: 'bo-3',
    numberKey: 'boNumber',
    number: 'bo. 3',
    title: 'Опус 3',
    genre: 'Романс, мистецька пісня',
    language: 'bilingual',
    yearRange: '1922',
    status: BaseContentStatuses.Draft,
    updatedAt: '2025-09-11T00:00:00.000Z',
    works: [
      ['bo-work-3-1', 'Пісня №2', '1922'],
      ['bo-work-3-2', 'Пісня №4 «Нічний вітер»', '1931']
    ]
  },
  {
    id: 'bo-4',
    numberKey: 'boNumber',
    number: 'bo. 4',
    title: 'Без опусні 1',
    genre: 'Романс, мистецька пісня',
    language: 'en',
    yearRange: '1922',
    status: BaseContentStatuses.Draft,
    updatedAt: '2025-09-11T00:00:00.000Z',
    works: [
      ['bo-work-4-1', 'Пісня без опусу', '1922'],
      ['bo-work-4-2', '№1«Після бою», сл. І. Буніна, укр.пер. М. Стріхи', '1932'],
      ['bo-work-4-3', 'Прелюдія без опусу', '1935']
    ]
  },
  {
    id: 'bo-5',
    numberKey: 'boNumber',
    number: 'bo. 5',
    title: 'Без опусні 2',
    genre: 'Соната',
    language: 'uk',
    yearRange: '1930-1936',
    status: BaseContentStatuses.Published,
    updatedAt: '2025-09-12T00:00:00.000Z',
    works: [
      ['bo-work-5-1', 'Скерцо без опусу', '1930'],
      ['bo-work-5-2', 'Рондо без опусу', '1936']
    ]
  },
  {
    id: 'bo-6',
    numberKey: 'boNumber',
    number: 'bo. 6',
    title: 'Хорові мініатюри',
    genre: 'Хор',
    language: 'uk',
    yearRange: '1934-1938',
    status: BaseContentStatuses.Draft,
    updatedAt: '2025-09-14T00:00:00.000Z',
    works: [
      ['bo-work-6-1', 'Ave Maria (без опусу)', '1934'],
      ['bo-work-6-2', 'Kyrie (без опусу)', '1938']
    ]
  }
];

export const WORKS_MOCK_DATA: WorksMockData = {
  opusGroups: OPUS_GROUP_SEEDS.map((seed) => buildGroup(seed) as OpusGroup),
  ungroupedGroups: UNGROUPED_GROUP_SEEDS.map((seed) => buildGroup(seed) as UngroupedGroup)
};
