import { GroupData, GroupPerformance, GroupPhoto,GroupWork } from '~/constants/creativity';

export const mockAvailableWorks: GroupWork[] = [
  { id: 'free-1', title: 'Соната №2 для фортепіано', genre: { uk: 'Соната', en: 'Sonata' } },
  { id: 'free-2', title: 'Симфонія №4', genre: { uk: 'Симфонія', en: 'Symphony' } },
  { id: 'free-3', title: 'Прелюдія до мінор', genre: { uk: 'Прелюдія', en: 'Prelude' } },
  { id: 'free-4', title: 'Український квінтет (вільний запис)', genre: { uk: 'Квінтет', en: 'Quintet' } }
];

export const mockInitialGroupData: GroupData = {
  titlePrefix: 'Op.',
  groupNumber: '42',
  additionalText: 'bis',
  groupTitle: {
    uk: 'Перший струнний квартет (d moll)',
    en: 'First String Quartet (d minor)'
  },
  creationYear: '1980', 
  endYear: '', 
  dateAdditionalText: {
    uk: 'Приблизно',
    en: ''
  },
  parts: {
    uk: 'I. Allegro e poco agitato \nII. Lento e tranquillo \nIII. Allegro \nIV. Allegro risoluto',
    en: 'I. Allegro e poco agitato \nII. Lento e tranquillo \nIII. Allegro \nIV. Allegro risoluto'
  },
  description: {
    uk: { type: 'doc', content: [] } as Record<string, unknown>,
    en: { type: 'doc', content: [] } as Record<string, unknown>
  },
  photos: [
    {
      id: 'mock-photo-1',
      src: 'https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/about-us-gomon.png',
      fileName: 'original_score_1922.jpg',
      caption: 'Прим’єра опери “Золотий обруч” у Львові 2025',
      altText: 'Назва файлу зображення',
      crop: null
    },
    {
      id: 'mock-photo-2',
      src: 'https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/1781613623635-fb2403f5d3c5eb47.png',
      fileName: 'quartet_performance.png',
      caption: 'Прим’єра опери “Золотий обруч” у Львові 2025',
      altText: 'Назва файлу зображення',
      crop: null
    }
  ] as GroupPhoto[],
  works: [
    {
      id: 'mock-work-1',
      title: '№1«Після бою», сл. І. Буніна, укр.пер. М. Стріхи',
      genre: { uk: 'Романс', en: 'Romance' }
    },
    {
      id: 'mock-work-2',
      title: '№2«Смерть», сл. І. Буніна, укр.пер. М. Стріхи',
      genre: { uk: 'Романс', en: 'Romance' }
    },
    {
      id: 'mock-work-3',
      title: '№3«Був цар», сл. Г. Гейне, укр. пер. М. Стріхи',
      genre: { uk: 'Пісня', en: 'Song' }
    }
  ] as GroupWork[],
  performancesTitle: 'Версії виконання опери "Золотий обруч"',
  performances: [
    {
      id: 'mock-perf-1',
      url: 'https://www.youtube.com/watch?v=yhnNXrp2lTM',
      caption: 'Запис фіналу опери у виконанні хору та оркестру Київської опери (1975 р.)'
    },
    {
      id: 'mock-perf-2',
      url: 'https://lf-client-stage-a3ama9eydjfucnbj.polandcentral-01.azurewebsites.net/uk',
      caption: 'Симфонічна сюїта на теми з опери, Львівська національна філармонія (2024 р.)'
    }
  ] as GroupPerformance[],
  status: 'draft'
};
