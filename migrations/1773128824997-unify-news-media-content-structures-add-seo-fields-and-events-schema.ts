import type { Db } from 'mongodb';

async function migrateMediaMentions(db: Db, now: string): Promise<void> {
  const mediaMentions = await db.collection('mediamentions').find({}).toArray();
  for (const doc of mediaMentions) {
    if (typeof doc.title !== 'string') continue;

    await db.collection('mediamentions').updateOne(
      { _id: doc._id },
      {
        $set: {
          adminTitle: doc.title,
          title: { uk: doc.title, en: doc.title },
          description: { uk: doc.description || '', en: doc.description || '' },
          keywords: { uk: '', en: '' },
          allowIndexation: { uk: true, en: true },
          status: (doc.status || 'draft').toLowerCase(),
          publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : null,
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : now,
          updatedAt: now,
          'coverImage.alt': {
            uk: doc.coverImage?.alt || '',
            en: doc.coverImage?.alt || ''
          },
          'coverImage.caption': { uk: '', en: '' }
        }
      }
    );
  }
}

async function migrateNews(db: Db, now: string): Promise<void> {
  const news = await db.collection('news').find({}).toArray();
  for (const doc of news) {
    await db.collection('news').updateOne(
      { _id: doc._id },
      {
        $set: {
          adminTitle: doc.title?.uk || 'Untitled News',
          keywords: { uk: '', en: '' },
          allowIndexation: { uk: true, en: true },
          newsDate: doc.newsDate ? new Date(doc.newsDate).toISOString() : null,
          publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : null,
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : now,
          updatedAt: now
        }
      }
    );
  }
}

async function migrateEvents(db: Db, now: string): Promise<void> {
  const events = await db.collection('events').find({}).toArray();
  for (const doc of events) {
    await db.collection('events').updateOne(
      { _id: doc._id },
      {
        $set: {
          adminTitle: doc.title?.uk || 'Untitled Event',
          keywords: { uk: '', en: '' },
          allowIndexation: { uk: true, en: true },
          meta: { views: doc.visits?.views || 0 },
          updatedAt: now,
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : now,
          publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : null
        },
        $unset: { visits: '' }
      }
    );
  }
}

export async function up(db: Db): Promise<void> {
  const now = new Date().toISOString();

  await migrateMediaMentions(db, now);
  await migrateNews(db, now);
  await migrateEvents(db, now);
}

export async function down(db: Db): Promise<void> {
  const mediaMentions = await db.collection('mediamentions').find({}).toArray();
  for (const doc of mediaMentions) {
    if (doc.title && typeof doc.title === 'object') {
      await db.collection('mediamentions').updateOne(
        { _id: doc._id },
        {
          $set: {
            title: doc.title.uk,
            description: doc.description.uk,
            status: (doc.status || '').toUpperCase(),
            'coverImage.alt': doc.coverImage?.alt?.uk || ''
          },
          $unset: {
            adminTitle: '',
            keywords: '',
            allowIndexation: '',
            'coverImage.caption': ''
          }
        }
      );
    }
  }

  await db.collection('news').updateMany({}, {
    $unset: { adminTitle: '', keywords: '', allowIndexation: '' }
  });

  const events = await db.collection('events').find({}).toArray();
  for (const doc of events) {
    await db.collection('events').updateOne(
      { _id: doc._id },
      {
        $set: { visits: { views: doc.meta?.views || 0 } },
        $unset: { adminTitle: '', keywords: '', allowIndexation: '', meta: '' }
      }
    );
  }
}