import type { Db } from 'mongodb';

import { PageCategories, PageStatus } from '~/types/enums/common.enums';

const SLUG = 'archive';
const COLLECTION = 'pages';
const MIGRATION_ID = '1789554233928-add-archive-page';

export async function up(db: Db): Promise<void> {
  const baseStorageUrl = process.env.STORAGE_BASE_URL;

  if (!baseStorageUrl) {
    throw new Error('Provide STORAGE_BASE_URL');
  }

  const pages = db.collection(COLLECTION);
  const existing = await pages.findOne({ slug: SLUG });

  if (existing) {
    return;
  }

  const now = new Date();

  await pages.insertOne({
    slug: SLUG,
    title: { uk: 'Архів', en: 'Archive' },
    status: PageStatus.Published,
    category: PageCategories.Archive,
    pageType: 'ArchivePage',
    coverImage: {
      src: `${baseStorageUrl}/photos/about-us-foundation-first.png`,
      alt: { uk: 'Архів', en: 'Archive' }
    },
    blocks: {
      PageCaption: {
        description: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        }
      }
    },
    blocksOrder: ['PageCaption'],
    description: { uk: 'Архів', en: 'Archive' },
    keywords: { uk: '', en: '' },
    canonicalUrl: { uk: '', en: '' },
    allowIndexation: { uk: true, en: true },
    _migrationId: MIGRATION_ID,
    createdAt: now,
    updatedAt: now
  });
}

export async function down(db: Db): Promise<void> {
  await db.collection(COLLECTION).deleteOne({
    slug: SLUG,
    _migrationId: MIGRATION_ID
  });
}