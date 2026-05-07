import { BaseContentStatuses } from '~/types/enums/common.enums';

export type WorkStatus = typeof BaseContentStatuses[keyof typeof BaseContentStatuses];

export type WorkItem = {
  id: string;
  title: string;
  year: string;
  status?: WorkStatus;
  updatedAt?: string;
  createdAt?: string;
  publishedAt?: string;
};

export type OpusGroup = {
  id: string;
  opusNumber: string;
  title: string;
  genre: string;
  language: 'uk' | 'en' | 'bilingual';
  yearRange: string;
  status: WorkStatus;
  updatedAt: string;
  works: WorkItem[];
};

export type UngroupedGroup = {
  id: string;
  boNumber: string;
  title: string;
  genre: string;
  language: 'uk' | 'en' | 'bilingual';
  yearRange: string;
  status: WorkStatus;
  updatedAt: string;
  works: WorkItem[];
};

export type WorksMockData = {
  opusGroups: OpusGroup[];
  ungroupedGroups: UngroupedGroup[];
};

export const WORKS_MOCK_DATA: WorksMockData = {
  opusGroups: [
    {
      id: 'opus-1',
      opusNumber: 'op. 1',
      title: 'Перший струнний квартет (d moll)',
      genre: 'Струнний квартет',
      language: 'uk',
      yearRange: '1920-1930',
      status: BaseContentStatuses.Published,
      updatedAt: '2025-09-11T00:00:00.000Z',
      works: [
        {
          id: 'work-1-1',
          title: '№1«Після бою», сл. І. Буніна, укр.пер. М. Стріхи',
          year: '1922'
        },
        {
          id: 'work-1-2',
          title: '№3«Був цар», сл. Г. Гейне, укр. пер. М. Стріхи',
          year: '1922'
        },
        {
          id: 'work-1-3',
          title: '№3«Був цар», сл. Г. Гейне, укр. пер. М. Стріхи',
          year: '1922'
        }
      ]
    },
    {
      id: 'opus-2',
      opusNumber: 'op. 2',
      title: 'Опус 2',
      genre: 'Романс, мистецька пісня',
      language: 'uk',
      yearRange: '1930-1940',
      status: BaseContentStatuses.Draft,
      updatedAt: '2025-09-11T00:00:00.000Z',
      works: [
        {
          id: 'work-2-1',
          title: '№1 «Туман над полем»',
          year: '1931'
        },
        {
          id: 'work-2-2',
          title: '№2 «Весняний мотив»',
          year: '1934'
        }
      ]
    },
    {
      id: 'opus-3',
      opusNumber: 'op. 3',
      title: 'Опус 3',
      genre: 'Романс, мистецька пісня',
      language: 'bilingual',
      yearRange: '1922',
      status: BaseContentStatuses.Draft,
      updatedAt: '2025-09-11T00:00:00.000Z',
      works: [
        {
          id: 'work-3-1',
          title: '№1 «Ноктюрн»',
          year: '1922'
        }
      ]
    },
    {
      id: 'opus-4',
      opusNumber: 'op. 4',
      title: 'Три романси на вірші Т. Шевченка',
      genre: 'Романс, мистецька пісня',
      language: 'uk',
      yearRange: '1923-1924',
      status: BaseContentStatuses.Editing,
      updatedAt: '2025-09-13T00:00:00.000Z',
      works: [
        {
          id: 'work-4-1',
          title: '№1 «Думи мої»',
          year: '1923'
        },
        {
          id: 'work-4-2',
          title: '№2 «Минають дні»',
          year: '1924'
        }
      ]
    },
    {
      id: 'opus-5',
      opusNumber: 'op. 5',
      title: 'Соната для фортепіано №1',
      genre: 'Соната',
      language: 'en',
      yearRange: '1925',
      status: BaseContentStatuses.Published,
      updatedAt: '2025-09-10T00:00:00.000Z',
      works: [
        {
          id: 'work-5-1',
          title: 'I. Allegro moderato',
          year: '1925'
        },
        {
          id: 'work-5-2',
          title: 'II. Largo',
          year: '1925'
        },
        {
          id: 'work-5-3',
          title: 'III. Finale',
          year: '1925'
        }
      ]
    },
    {
      id: 'opus-6',
      opusNumber: 'op. 6',
      title: 'Симфонічна сюїта',
      genre: 'Симфонія',
      language: 'uk',
      yearRange: '1926-1927',
      status: BaseContentStatuses.Draft,
      updatedAt: '2025-09-09T00:00:00.000Z',
      works: [
        {
          id: 'work-6-1',
          title: 'I. Прелюдія',
          year: '1926'
        },
        {
          id: 'work-6-2',
          title: 'II. Intermezzo',
          year: '1927'
        }
      ]
    }
  ],
  ungroupedGroups: [
    {
      id: 'bo-1',
      boNumber: 'bo. 1',
      title: 'Перший струнний квартет (d moll)',
      genre: 'Струнний квартет',
      language: 'uk',
      yearRange: '1922',
      status: BaseContentStatuses.Published,
      updatedAt: '2025-09-11T00:00:00.000Z',
      works: [
        {
          id: 'bo-work-1-1',
          title: '№1«Після бою», сл. І. Буніна, укр.пер. М. Стріхи',
          year: '1922'
        },
        {
          id: 'bo-work-1-2',
          title: '№2«Смерть», сл. І. Буніна, укр.пер. М. Стріхи',
          year: '1922'
        },
        {
          id: 'bo-work-1-3',
          title: '№3«Був цар», сл. Г. Гейне, укр. пер. М. Стріхи',
          year: '1922'
        }
      ]
    },
    {
      id: 'bo-2',
      boNumber: 'bo. 2',
      title: 'Опус 2',
      genre: 'Романс, мистецька пісня',
      language: 'uk',
      yearRange: '1922',
      status: BaseContentStatuses.Draft,
      updatedAt: '2025-09-11T00:00:00.000Z',
      works: [
        {
          id: 'bo-work-2-1',
          title: 'Пісня №1',
          year: '1922'
        },
        {
          id: 'bo-work-2-2',
          title: 'Пісня №3 «Дорога додому»',
          year: '1932'
        }
      ]
    },
    {
      id: 'bo-3',
      boNumber: 'bo. 3',
      title: 'Опус 3',
      genre: 'Романс, мистецька пісня',
      language: 'bilingual',
      yearRange: '1922',
      status: BaseContentStatuses.Draft,
      updatedAt: '2025-09-11T00:00:00.000Z',
      works: [
        {
          id: 'bo-work-3-1',
          title: 'Пісня №2',
          year: '1922'
        },
        {
          id: 'bo-work-3-2',
          title: 'Пісня №4 «Нічний вітер»',
          year: '1931'
        }
      ]
    },
    {
      id: 'bo-4',
      boNumber: 'bo. 4',
      title: 'Без опусні 1',
      genre: 'Романс, мистецька пісня',
      language: 'en',
      yearRange: '1922',
      status: BaseContentStatuses.Draft,
      updatedAt: '2025-09-11T00:00:00.000Z',
      works: [
        {
          id: 'bo-work-4-1',
          title: 'Пісня без опусу',
          year: '1922'
        },
        {
          id: 'bo-work-4-2',
          title: '№1«Після бою», сл. І. Буніна, укр.пер. М. Стріхи',
          year: '1932'
        },
        {
          id: 'bo-work-4-3',
          title: 'Прелюдія без опусу',
          year: '1935'
        }
      ]
    },
    {
      id: 'bo-5',
      boNumber: 'bo. 5',
      title: 'Без опусні 2',
      genre: 'Соната',
      language: 'uk',
      yearRange: '1930-1936',
      status: BaseContentStatuses.Published,
      updatedAt: '2025-09-12T00:00:00.000Z',
      works: [
        {
          id: 'bo-work-5-1',
          title: 'Скерцо без опусу',
          year: '1930'
        },
        {
          id: 'bo-work-5-2',
          title: 'Рондо без опусу',
          year: '1936'
        }
      ]
    },
    {
      id: 'bo-6',
      boNumber: 'bo. 6',
      title: 'Хорові мініатюри',
      genre: 'Хор',
      language: 'uk',
      yearRange: '1934-1938',
      status: BaseContentStatuses.Draft,
      updatedAt: '2025-09-14T00:00:00.000Z',
      works: [
        {
          id: 'bo-work-6-1',
          title: 'Ave Maria (без опусу)',
          year: '1934'
        },
        {
          id: 'bo-work-6-2',
          title: 'Kyrie (без опусу)',
          year: '1938'
        }
      ]
    }
  ]
};
