import { Db } from 'mongodb';

import { PageCategories } from '~/types/enums/common.enums';
const baseStorageUrl = process.env.STORAGE_BASE_URL;

if (!baseStorageUrl) {
  throw new Error('Provide STORAGE_BASE_URL');
}

const DEFAULT_COVER_IMAGE = {
  src: `${baseStorageUrl}/photos/about-us-foundation-first.png`,
  alt: { uk: 'Зображення', en: 'Image' },
};

const MIGRATION_CONFIG = {
  'biography': PageCategories.BorysLiatoshynsky,
  'research': PageCategories.BorysLiatoshynsky,
  'about-us': PageCategories.Foundation,
  'cooperation': PageCategories.Cooperation,
  'privacy-policy': PageCategories.Other,
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
