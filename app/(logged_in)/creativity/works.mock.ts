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
type GroupKind = 'opus' | 'ungrouped';

type GroupSeed = Readonly<[
  kind: GroupKind,
  id: string,
  number: string,
  title: string,
  genre: string,
  language: WorkLanguage,
  yearRange: string,
  status: WorkStatus,
  updatedAt: string,
  works: ReadonlyArray<WorkSeed>
]>;

const buildWorks = (works: ReadonlyArray<WorkSeed>): WorkItem[] =>
  works.map(([id, title, year]) => ({ id, title, year }));

const buildGroup = <TNumberKey extends 'opusNumber' | 'boNumber'>(
  numberKey: TNumberKey,
  [, id, number, title, genre, language, yearRange, status, updatedAt, works]: GroupSeed
): WorkGroupBase & Record<TNumberKey, string> => ({
  id,
  [numberKey]: number,
  title,
  genre,
  language,
  yearRange,
  status,
  updatedAt,
  works: buildWorks(works)
}) as WorkGroupBase & Record<TNumberKey, string>;

const GROUP_SEEDS: ReadonlyArray<GroupSeed> = [
  [
    'opus',
    'opus-1',
    'op. 1',
    'Перший струнний квартет (d moll)',
    'Струнний квартет',
    'uk',
    '1920-1930',
    BaseContentStatuses.Published,
    '2025-09-11T00:00:00.000Z',
    [
      ['work-1-1', '№1«Після бою», сл. І. Буніна, укр.пер. М. Стріхи', '1922'],
      ['work-1-2', '№3«Був цар», сл. Г. Гейне, укр. пер. М. Стріхи', '1922'],
      ['work-1-3', '№3«Був цар», сл. Г. Гейне, укр. пер. М. Стріхи', '1922']
    ]
  ],
  [
    'opus',
    'opus-2',
    'op. 2',
    'Опус 2',
    'Романс, мистецька пісня',
    'uk',
    '1930-1940',
    BaseContentStatuses.Draft,
    '2025-09-11T00:00:00.000Z',
    [
      ['work-2-1', '№1 «Туман над полем»', '1931'],
      ['work-2-2', '№2 «Весняний мотив»', '1934']
    ]
  ],
  [
    'opus',
    'opus-3',
    'op. 3',
    'Опус 3',
    'Романс, мистецька пісня',
    'bilingual',
    '1922',
    BaseContentStatuses.Draft,
    '2025-09-11T00:00:00.000Z',
    [['work-3-1', '№1 «Ноктюрн»', '1922']]
  ],
  [
    'opus',
    'opus-4',
    'op. 4',
    'Три романси на вірші Т. Шевченка',
    'Романс, мистецька пісня',
    'uk',
    '1923-1924',
    BaseContentStatuses.Editing,
    '2025-09-13T00:00:00.000Z',
    [
      ['work-4-1', '№1 «Думи мої»', '1923'],
      ['work-4-2', '№2 «Минають дні»', '1924']
    ]
  ],
  [
    'opus',
    'opus-5',
    'op. 5',
    'Соната для фортепіано №1',
    'Соната',
    'en',
    '1925',
    BaseContentStatuses.Published,
    '2025-09-10T00:00:00.000Z',
    [
      ['work-5-1', 'I. Allegro moderato', '1925'],
      ['work-5-2', 'II. Largo', '1925'],
      ['work-5-3', 'III. Finale', '1925']
    ]
  ],
  [
    'opus',
    'opus-6',
    'op. 6',
    'Симфонічна сюїта',
    'Симфонія',
    'uk',
    '1926-1927',
    BaseContentStatuses.Draft,
    '2025-09-09T00:00:00.000Z',
    [
      ['work-6-1', 'I. Прелюдія', '1926'],
      ['work-6-2', 'II. Intermezzo', '1927']
    ]
  ],
  [
    'ungrouped',
    'bo-1',
    'bo. 1',
    'Перший струнний квартет (d moll)',
    'Струнний квартет',
    'uk',
    '1922',
    BaseContentStatuses.Published,
    '2025-09-11T00:00:00.000Z',
    [
      ['bo-work-1-1', '№1«Після бою», сл. І. Буніна, укр.пер. М. Стріхи', '1922'],
      ['bo-work-1-2', '№2«Смерть», сл. І. Буніна, укр.пер. М. Стріхи', '1922'],
      ['bo-work-1-3', '№3«Був цар», сл. Г. Гейне, укр. пер. М. Стріхи', '1922']
    ]
  ],
  [
    'ungrouped',
    'bo-2',
    'bo. 2',
    'Опус 2',
    'Романс, мистецька пісня',
    'uk',
    '1922',
    BaseContentStatuses.Draft,
    '2025-09-11T00:00:00.000Z',
    [
      ['bo-work-2-1', 'Пісня №1', '1922'],
      ['bo-work-2-2', 'Пісня №3 «Дорога додому»', '1932']
    ]
  ],
  [
    'ungrouped',
    'bo-3',
    'bo. 3',
    'Опус 3',
    'Романс, мистецька пісня',
    'bilingual',
    '1922',
    BaseContentStatuses.Draft,
    '2025-09-11T00:00:00.000Z',
    [
      ['bo-work-3-1', 'Пісня №2', '1922'],
      ['bo-work-3-2', 'Пісня №4 «Нічний вітер»', '1931']
    ]
  ],
  [
    'ungrouped',
    'bo-4',
    'bo. 4',
    'Без опусні 1',
    'Романс, мистецька пісня',
    'en',
    '1922',
    BaseContentStatuses.Draft,
    '2025-09-11T00:00:00.000Z',
    [
      ['bo-work-4-1', 'Пісня без опусу', '1922'],
      ['bo-work-4-2', '№1«Після бою», сл. І. Буніна, укр.пер. М. Стріхи', '1932'],
      ['bo-work-4-3', 'Прелюдія без опусу', '1935']
    ]
  ],
  [
    'ungrouped',
    'bo-5',
    'bo. 5',
    'Без опусні 2',
    'Соната',
    'uk',
    '1930-1936',
    BaseContentStatuses.Published,
    '2025-09-12T00:00:00.000Z',
    [
      ['bo-work-5-1', 'Скерцо без опусу', '1930'],
      ['bo-work-5-2', 'Рондо без опусу', '1936']
    ]
  ],
  [
    'ungrouped',
    'bo-6',
    'bo. 6',
    'Хорові мініатюри',
    'Хор',
    'uk',
    '1934-1938',
    BaseContentStatuses.Draft,
    '2025-09-14T00:00:00.000Z',
    [
      ['bo-work-6-1', 'Ave Maria (без опусу)', '1934'],
      ['bo-work-6-2', 'Kyrie (без опусу)', '1938']
    ]
  ]
];

export const WORKS_MOCK_DATA: WorksMockData = {
  opusGroups: GROUP_SEEDS.filter(([kind]) => kind === 'opus').map(
    (seed) => buildGroup('opusNumber', seed) as OpusGroup
  ),
  ungroupedGroups: GROUP_SEEDS.filter(([kind]) => kind === 'ungrouped').map(
    (seed) => buildGroup('boNumber', seed) as UngroupedGroup
  )
};
