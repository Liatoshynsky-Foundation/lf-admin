import type { Db } from 'mongodb';

const NEW_PARTNERSHIP_FORMATS = {
  title: {
    uk: 'Формати співпраці',
    en: 'Forms of Collaboration'
  },
  actionButtonText: {
    uk: 'Запропонувати співпрацю',
    en: 'Propose a Collaboration'
  },
  firstRowFirstCard: {
    title: {
      uk: 'Спільні проєкти',
      en: 'Joint Projects'
    },
    list: [
      { uk: 'Концерти та фестивалі', en: 'Concerts and festivals' },
      { uk: 'Виставки', en: 'Exhibitions' },
      { uk: 'Освітні програми', en: 'Educational programmes' },
      { uk: 'Дослідницькі проєкти', en: 'Research projects' }
    ]
  },
  firstRowSecondCard: {
    title: {
      uk: 'Професійна співпраця',
      en: 'Professional Collaboration'
    },
    list: [
      { uk: 'Виконавська діяльність', en: 'Performance' },
      { uk: 'Дослідження', en: 'Research' },
      { uk: 'Редагування та переклади', en: 'Editing and translation' },
      { uk: 'Нотні видання', en: 'Music editions' }
    ]
  },
  secondRowFirstCard: {
    title: {
      uk: 'Ресурсна підтримка',
      en: 'In-Kind Support'
    },
    list: [
      { uk: 'Друк матеріалів', en: 'Printing' },
      { uk: 'Технічне обладнання', en: 'Technical equipment' },
      { uk: 'Логістика', en: 'Logistics' },
      { uk: 'Цифрові технології', en: 'Digital technologies' }
    ]
  },
  secondRowSecondCard: {
    title: {
      uk: 'Фінансова підтримка',
      en: 'Financial Support'
    },
    list: [
      { uk: 'Нотні видання', en: 'Music editions' },
      { uk: 'Дослідження', en: 'Research' },
      { uk: 'Робота з архівом', en: 'Archival work' },
      { uk: 'Реалізація проєктів', en: 'Project funding' }
    ]
  }
};

const OLD_PARTNERSHIP_FORMATS = {
  title: {
    uk: 'Формати партнерства:',
    en: 'Partnership formats:'
  },
  actionButtonText: {
    uk: 'Запропонувати допомогу',
    en: 'Offer help'
  },
  firstRowFirstCard: {
    title: {
      uk: 'Матеріально-технічна підтримка',
      en: 'Logistical and technical support'
    },
    list: [
      { uk: 'Звукове обладнання', en: 'Sound equipment' },
      { uk: 'Онлайн–трансляції', en: 'Online streaming' },
      { uk: 'Логістика подій', en: 'Event logistics' },
      { uk: 'Оцифрування архівів', en: 'Archive digitization' }
    ]
  }
};

const TARGET_COLLECTIONS = ['pages', 'draftpages'];
const SLUG = 'cooperation';

export async function up(db: Db): Promise<void> {
  const now = new Date();

  for (const collectionName of TARGET_COLLECTIONS) {
    await db.collection(collectionName).updateOne(
      { slug: SLUG },
      {
        $set: {
          'blocks.partnershipFormats.title': NEW_PARTNERSHIP_FORMATS.title,
          'blocks.partnershipFormats.actionButtonText': NEW_PARTNERSHIP_FORMATS.actionButtonText,
          'blocks.partnershipFormats.firstRowFirstCard.title': NEW_PARTNERSHIP_FORMATS.firstRowFirstCard.title,
          'blocks.partnershipFormats.firstRowFirstCard.list': NEW_PARTNERSHIP_FORMATS.firstRowFirstCard.list,
          'blocks.partnershipFormats.firstRowSecondCard.title': NEW_PARTNERSHIP_FORMATS.firstRowSecondCard.title,
          'blocks.partnershipFormats.firstRowSecondCard.list': NEW_PARTNERSHIP_FORMATS.firstRowSecondCard.list,
          'blocks.partnershipFormats.secondRowFirstCard.title': NEW_PARTNERSHIP_FORMATS.secondRowFirstCard.title,
          'blocks.partnershipFormats.secondRowFirstCard.list': NEW_PARTNERSHIP_FORMATS.secondRowFirstCard.list,
          'blocks.partnershipFormats.secondRowSecondCard.title': NEW_PARTNERSHIP_FORMATS.secondRowSecondCard.title,
          'blocks.partnershipFormats.secondRowSecondCard.list': NEW_PARTNERSHIP_FORMATS.secondRowSecondCard.list,
          updatedAt: now
        }
      }
    );
  }
}

export async function down(db: Db): Promise<void> {
  const now = new Date();

  for (const collectionName of TARGET_COLLECTIONS) {
    await db.collection(collectionName).updateOne(
      { slug: SLUG },
      {
        $set: {
          'blocks.partnershipFormats.title': OLD_PARTNERSHIP_FORMATS.title,
          'blocks.partnershipFormats.actionButtonText': OLD_PARTNERSHIP_FORMATS.actionButtonText,
          'blocks.partnershipFormats.firstRowFirstCard.title': OLD_PARTNERSHIP_FORMATS.firstRowFirstCard.title,
          'blocks.partnershipFormats.firstRowFirstCard.list': OLD_PARTNERSHIP_FORMATS.firstRowFirstCard.list,
          updatedAt: now
        }
      }
    );
  }
}
