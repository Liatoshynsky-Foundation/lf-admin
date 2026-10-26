import type { Db } from 'mongodb';

const COLLECTIONS = 'pages';
const OLD_SLUG = 'publications';
const NEW_SLUG = 'news';

export async function up(db: Db): Promise<void> {
  const pages = db.collection(COLLECTIONS);
  const existing = await pages.findOne({ slug: NEW_SLUG });

  if (existing) throw new Error(`Page with slug ${NEW_SLUG} already exists`);

  const result = await pages.updateOne(
    { slug: OLD_SLUG },
    {
      $set: {
        slug: NEW_SLUG,
        updatedAt: new Date()
      }
    }
  );

  if (result.matchedCount === 0) throw new Error(`Page with slug ${OLD_SLUG} was not found`);
}

export async function down(db: Db): Promise<void> {
  await db.collection(COLLECTIONS).updateOne(
    { slug: NEW_SLUG },
    {
      $set: {
        slug: OLD_SLUG,
        updatedAt: new Date()
      }
    }
  );
}
