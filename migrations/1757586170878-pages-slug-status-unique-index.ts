import { Db } from 'mongodb';

export async function up(db: Db) {
  const pages = db.collection('pages');

  const indexes = await pages.indexes();
  const slugOnly = indexes.find(
    (i) => i.key && (i.key as Record<string, 1 | -1>).slug === 1 && i.unique === true && Object.keys(i.key).length === 1
  );

  if (slugOnly) {
    const indexName = typeof slugOnly.name === 'string' && slugOnly.name.length > 0 ? slugOnly.name : 'slug_1';
    await pages.dropIndex(indexName);
  }

  const hasCompound = (await pages.indexes()).some((i) => {
    const key = i.key as Record<string, 1 | -1> | undefined;
    return key?.slug === 1 && key?.status === 1;
  });

  if (!hasCompound) {
    await pages.createIndex({ slug: 1, status: 1 }, { unique: true, name: 'slug_1_status_1' });
  }
}

export async function down(db: Db) {
  const pages = db.collection('pages');

  const indexes = await pages.indexes();
  const compound = indexes.find((i) => {
    const key = i.key as Record<string, 1 | -1> | undefined;
    return key?.slug === 1 && key?.status === 1;
  });

  if (compound) {
    const indexName = typeof compound.name === 'string' && compound.name.length > 0 ? compound.name : 'slug_1_status_1';
    await pages.dropIndex(indexName);
  }

  const hasSlugOnly = (await pages.indexes()).some((i) => {
    const key = i.key as Record<string, 1 | -1> | undefined;
    return key?.slug === 1 && Object.keys(key ?? {}).length === 1;
  });

  if (!hasSlugOnly) {
    await pages.createIndex({ slug: 1 }, { unique: true, name: 'slug_1' });
  }
}
