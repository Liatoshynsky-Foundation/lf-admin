import type { Db, ObjectId } from 'mongodb';
import fs from 'node:fs';
import path from 'node:path';

const TARGET_COLLECTION = 'pages';
const TARGET_SLUGS = ['biography', 'cooperation'];

const MIGRATION_MAP_PATH = path.resolve(
  process.cwd(),
  'migrations/data/page-image-paths-to-r2.json'
);

interface MigrationMapItem {
  old: string;
  new: string;
}

interface MongoDocument {
  _id: ObjectId;
  slug?: string;
  [key: string]: unknown;
}

function readMigrationMap(): MigrationMapItem[] {
  return JSON.parse(fs.readFileSync(MIGRATION_MAP_PATH, 'utf8'));
}

function createReplacementMap(
  migrationMap: MigrationMapItem[],
  direction: 'up' | 'down'
): Map<string, string> {
  return new Map(
    migrationMap.map(({ old, new: newValue }) =>
      direction === 'up' ? [old, newValue] : [newValue, old]
    )
  );
}

function collectUpdates(
  value: unknown,
  replacements: Map<string, string>,
  currentPath = ''
): Record<string, string> {
  const updates: Record<string, string> = {};

  if (typeof value === 'string') {
    const replacement = replacements.get(value);

    if (replacement && replacement !== value) {
      updates[currentPath] = replacement;
    }

    return updates;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const nextPath = currentPath ? `${currentPath}.${index}` : `${index}`;

      Object.assign(updates, collectUpdates(item, replacements, nextPath));
    });

    return updates;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      if (key === '_id') return;

      const nextPath = currentPath ? `${currentPath}.${key}` : key;

      Object.assign(updates, collectUpdates(item, replacements, nextPath));
    });
  }

  return updates;
}

async function replaceImagePaths(
  db: Db,
  direction: 'up' | 'down'
): Promise<void> {
  const migrationMap = readMigrationMap();
  const replacements = createReplacementMap(migrationMap, direction);
  const collection = db.collection<MongoDocument>(TARGET_COLLECTION);

  const cursor = collection.find({
    slug: { $in: TARGET_SLUGS }
  });

  const operations = [];

  for await (const document of cursor) {
    const $set = collectUpdates(document, replacements);

    if (Object.keys($set).length === 0) {
      continue;
    }

    operations.push({
      updateOne: {
        filter: { _id: document._id },
        update: { $set }
      }
    });
  }

  if (operations.length === 0) {
    return;
  }

  await collection.bulkWrite(operations, {
    ordered: false
  });
}

export async function up(db: Db): Promise<void> {
  await replaceImagePaths(db, 'up');
}

export async function down(db: Db): Promise<void> {
  await replaceImagePaths(db, 'down');
}