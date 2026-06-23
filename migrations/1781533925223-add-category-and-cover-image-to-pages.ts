import { Db } from 'mongodb';

const DEFAULT_COVER_IMAGE = {
  src: 'https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/about-us-foundation-first.png',
  alt: { uk: 'Зображення', en: 'Image' },
};

const MIGRATION_CONFIG = {
  'biography': 'borys-liatoshynsky',
  'research': 'borys-liatoshynsky',
  'about-us': 'foundation',
  'cooperation': 'cooperation',
  'privacy-policy': 'other',
};

export async function up(db: Db): Promise<void> {
  const operations = Object.entries(MIGRATION_CONFIG).map(([slug, category]) => ({
    updateOne: {
      filter: { slug: slug },
      update: [{ $set: { category: category, coverImage: { $ifNull: ['$coverImage', DEFAULT_COVER_IMAGE] } } }]
    }
  }));

  await db.collection('pages').bulkWrite(operations);
}

export async function down(db: Db): Promise<void> {
  const slugs = Object.keys(MIGRATION_CONFIG);

  await db.collection('pages').updateMany(
    { slug: { $in: slugs } }, 
    { $unset: { category: '', coverImage: '' } }
  );
}
