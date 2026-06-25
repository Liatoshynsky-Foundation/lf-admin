// group.mock.ts

export const mockAvailableWorks = [
  { id: 'free-1', title: 'Соната №2 для фортепіано', genre: { uk: 'Соната', en: 'Sonata' } },
  { id: 'free-2', title: 'Симфонія №4', genre: { uk: 'Симфонія', en: 'Symphony' } },
  { id: 'free-3', title: 'Прелюдія до мінор', genre: { uk: 'Прелюдія', en: 'Prelude' } },
  { id: 'free-4', title: 'Український квінтет (вільний запис)', genre: { uk: 'Квінтет', en: 'Quintet' } }
];

export const mockInitialGroupData = {
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
    uk: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Лібрето опери за мотивами історичної повісті Івана Франка «Захар Беркут» уклав драматург, критик та теоретик театру Яків Мамонтов. Твір написаний на замовлення Народного комісаріату освіти України. Опера має три редакції: перша українська редакція (1929), московська редакція (1930, існує лише в клавірі, ніколи не була виконана), друга українська редакція (середина 1960-х років, є скороченим варіантом першої української редакції).'
            }
          ]
        }
      ]
    } as Record<string, unknown>,
    en: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'The libretto of the opera, based on the historical story of Ivan Franko\'s "Zahar Berkut", was written by the dramatist, critic, and theater theorist Yakiv Mamontov. The work was written on order of the People\'s Commissariat of Education of Ukraine. The opera has three versions: the first Ukrainian version (1929), the Moscow version (1930, exists only in harpsichord arrangement, was never performed), and the second Ukrainian version (mid-1960s, is a shortened version of the first Ukrainian version).'
            }
          ]
        }
      ]
    } as Record<string, unknown>
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
  ],
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
  ],
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
  ],
  status: 'draft'
};
