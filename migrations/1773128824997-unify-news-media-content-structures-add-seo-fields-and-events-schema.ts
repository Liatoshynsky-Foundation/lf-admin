import type { Db, ObjectId } from 'mongodb';

interface BaseDoc {
  _id: ObjectId;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  publishedAt?: string | Date;
  title?: string | { uk: string; en: string };
  description?: string | { uk: string; en: string };
  status?: string;
}

interface MediaMentionDoc extends BaseDoc {
  coverImage?: {
    alt?: string | { uk: string; en: string };
    caption?: { uk: string; en: string };
  };
}

interface NewsDoc extends BaseDoc {
  newsDate?: string | Date;
}

interface EventDoc extends BaseDoc {
  meta?: { views: number };
  visits?: { views: number };
}

async function migrateMediaMentions(db: Db, now: string): Promise<void> {
  const cursor = db.collection<MediaMentionDoc>('mediamentions').find({});

  for await (const doc of cursor) {
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
            uk: typeof doc.coverImage?.alt === 'string' ? doc.coverImage.alt : '',
            en: typeof doc.coverImage?.alt === 'string' ? doc.coverImage.alt : ''
          },
          'coverImage.caption': { uk: '', en: '' }
        }
      }
    );
  }
}

async function migrateNews(db: Db, now: string): Promise<void> {
  const cursor = db.collection<NewsDoc>('news').find({});

  for await (const doc of cursor) {
    const titleUk = typeof doc.title === 'object' ? doc.title.uk : (doc.title || 'Untitled News');
    await db.collection('news').updateOne(
      { _id: doc._id },
      {
        $set: {
          adminTitle: titleUk,
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
  const cursor = db.collection<EventDoc>('events').find({});

  for await (const doc of cursor) {
    const titleUk = typeof doc.title === 'object' ? doc.title.uk : (doc.title || 'Untitled Event');
    await db.collection('events').updateOne(
      { _id: doc._id },
      {
        $set: {
          adminTitle: titleUk,
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
  const mmCursor = db.collection<MediaMentionDoc>('mediamentions').find({});
  for await (const doc of mmCursor) {
    if (doc.title && typeof doc.title === 'object') {
      await db.collection('mediamentions').updateOne(
        { _id: doc._id },
        {
          $set: {
            title: doc.title.uk,
            description: typeof doc.description === 'object' ? doc.description.uk : doc.description,
            status: (doc.status || '').toUpperCase(),
            'coverImage.alt': typeof doc.coverImage?.alt === 'object' ? doc.coverImage.alt.uk : ''
          },
          $unset: {
            adminTitle: '',
            keywords: '',
            allowIndexation: '',
            'coverImage.caption': '',
            updatedAt: ''
          }
        }
      );
    }
  }

  await db.collection('news').updateMany({}, {
    $unset: {
      adminTitle: '',
      keywords: '',
      allowIndexation: '',
      updatedAt: ''
    }
  });

  const eventCursor = db.collection<EventDoc>('events').find({});
  for await (const doc of eventCursor) {
    await db.collection('events').updateOne(
      { _id: doc._id },
      {
        $set: { visits: { views: doc.meta?.views || 0 } },
        $unset: {
          adminTitle: '',
          keywords: '',
          allowIndexation: '',
          meta: '',
          updatedAt: ''
        }
      }
    );
  }
}