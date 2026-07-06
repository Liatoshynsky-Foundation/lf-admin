import type { Db } from 'mongodb';

const TARGET_COLLECTIONS = ['pages', 'draftpages'];

export async function up(db: Db): Promise<void> {
  for (const collection of TARGET_COLLECTIONS) {
    await db.collection(collection).updateMany({}, [
      {
        $set: {
          description: { $ifNull: ['$description', { uk: '', en: '' }] },
          keywords: { $ifNull: ['$keywords', { uk: '', en: '' }] },
          canonicalUrl: { $ifNull: ['$canonicalUrl', { uk: '', en: '' }] },
          allowIndexation: { $ifNull: ['$allowIndexation', { uk: true, en: true }] }
        }
      }
    ]);
  }
}

export async function down(db: Db): Promise<void> {
  for (const collection of TARGET_COLLECTIONS) {
    await db.collection(collection).updateMany({}, { $unset: { description: '', keywords: '', canonicalUrl: '' } });
  }
}
