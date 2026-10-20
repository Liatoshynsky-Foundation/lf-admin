import type { Db } from 'mongodb';

import { PageCategories, PageStatus } from '~/types/enums/common.enums';

const SLUG = 'publications';
const COLLECTION = 'pages';
const MIGRATION_ID = '1792175424861-add-publications-page';

export async function up(db: Db): Promise<void> {
  const baseStorageUrl = process.env.STORAGE_BASE_URL;

  if (!baseStorageUrl) throw new Error('Provide STORAGE_BASE_URL');

  const pages = db.collection(COLLECTION);
  const existing = await pages.findOne({ slug: SLUG });

  if (existing) return;

  const now = new Date();

  await pages.insertOne({
    slug: SLUG,
    title: { uk: 'Новини, події та медіа', en: 'News, Events and Media' },
    status: PageStatus.Published,
    category: PageCategories.Foundation,
    pageType: 'PublicationsPage',
    coverImage: {
      src: `${baseStorageUrl}/photos/about-us-foundation-first.png`,
      alt: { uk: 'Новини, події та медіа', en: 'News, Events and Media' }
    },
    blocks: {
      PublicationsIntro: {
        publicationsIntro: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        },
        publicationsOutro: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        }
      }
    },
    blocksOrder: ['PublicationsIntro'],
    description: { uk: 'publications', en: 'publications' },
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
