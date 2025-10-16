import type { Db } from 'mongodb';

const TARGET_COLLECTION = 'navigations';

export async function up(db: Db): Promise<void> {
  const navigations = db.collection(TARGET_COLLECTION);
  const res = await navigations.insertOne({
    title: {
      en: 'War in Ukraine',
      uk: 'Війна в Україні'
    },
    links: [
      {
        label: {
          en: 'War in Ukraine',
          uk: 'Війна в Україні'
        },
        visibility: true,
        href: '/war-in-ukraine'
      }
    ],
    order: -1
  });

  if (!res.insertedId) {
    throw new Error('Migration UP failed: Unable to insert the new navigation link.');
  }
}

export async function down(db: Db): Promise<void> {
  const navigations = db.collection(TARGET_COLLECTION);
  const res = await navigations.deleteOne({
    order: { $lt: 0 }
  });

  if (res.deletedCount === 0) {
    throw new Error('Migration DOWN failed: Unable to delete the navigation link.');
  }
}
