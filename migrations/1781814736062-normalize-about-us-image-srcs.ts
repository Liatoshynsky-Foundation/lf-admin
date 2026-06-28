import type { AnyBulkWriteOperation, Db, ObjectId, UpdateFilter } from 'mongodb';
import fs from 'node:fs';
import path from 'node:path';

const TARGET_COLLECTIONS = ['pages', 'draftpages'];
const TARGET_SLUG = 'about-us';

const MIGRATION_MAP_PATH = path.resolve(
  process.cwd(),
  'migrations/data/about-us-image-src-normalization.json'
);

interface MigrationMapItem {
  path: string;
  src: string;
  generatedSrc: string | null;
  previousNewSrc?: string;
  newSrc: string;
}

interface MongoDocument {
  _id: ObjectId;
  slug?: string;
  [key: string]: unknown;
}

interface ImageDocument {
  src?: unknown;
  generatedSrc?: unknown;
  [key: string]: unknown;
}

function readMigrationMap(): MigrationMapItem[] {
  return JSON.parse(fs.readFileSync(MIGRATION_MAP_PATH, 'utf8'));
}

function getValueAtPath(value: unknown, targetPath: string): unknown {
  return targetPath.split('.').reduce<unknown>((currentValue, pathPart) => {
    if (currentValue === null || currentValue === undefined) {
      return undefined;
    }

    if (Array.isArray(currentValue)) {
      return currentValue[Number(pathPart)];
    }

    if (typeof currentValue === 'object') {
      return (currentValue as Record<string, unknown>)[pathPart];
    }

    return undefined;
  }, value);
}

function isImageDocument(value: unknown): value is ImageDocument {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function getKnownSourceValues(item: MigrationMapItem): Set<string> {
  return new Set(
    [item.src, item.newSrc, item.previousNewSrc].filter(
      (value): value is string => Boolean(value)
    )
  );
}

function createUpdateFilter(
  $set: Record<string, string>,
  $unset: Record<string, ''>
): UpdateFilter<MongoDocument> | null {
  const update: UpdateFilter<MongoDocument> = {};

  if (Object.keys($set).length > 0) {
    update.$set = $set;
  }

  if (Object.keys($unset).length > 0) {
    update.$unset = $unset;
  }

  return update.$set || update.$unset ? update : null;
}

function collectUpUpdates(
  document: MongoDocument,
  migrationMap: MigrationMapItem[]
): { $set: Record<string, string>; $unset: Record<string, ''> } {
  const $set: Record<string, string> = {};
  const $unset: Record<string, ''> = {};

  migrationMap.forEach((item) => {
    const image = getValueAtPath(document, item.path);

    if (!isImageDocument(image)) {
      return;
    }

    const knownSourceValues = getKnownSourceValues(item);
    const isKnownSource = knownSourceValues.has(image.src as string);

    if (isKnownSource && image.src !== item.newSrc) {
      $set[`${item.path}.src`] = item.newSrc;
    }

    if (isKnownSource) {
      $unset[`${item.path}.generatedSrc`] = '';
    }
  });

  return { $set, $unset };
}

function collectDownUpdates(
  document: MongoDocument,
  migrationMap: MigrationMapItem[]
): { $set: Record<string, string>; $unset: Record<string, ''> } {
  const $set: Record<string, string> = {};
  const $unset: Record<string, ''> = {};

  migrationMap.forEach((item) => {
    const image = getValueAtPath(document, item.path);

    if (!isImageDocument(image) || image.src !== item.newSrc) {
      return;
    }

    if (item.src !== item.newSrc) {
      $set[`${item.path}.src`] = item.src;
    }

    if (item.generatedSrc === null) {
      $unset[`${item.path}.generatedSrc`] = '';
      return;
    }

    $set[`${item.path}.generatedSrc`] = item.generatedSrc;
  });

  return { $set, $unset };
}

async function normalizeAboutUsImageSrcs(
  db: Db,
  direction: 'up' | 'down'
): Promise<void> {
  const migrationMap = readMigrationMap();

  for (const collectionName of TARGET_COLLECTIONS) {
    const collection = db.collection<MongoDocument>(collectionName);

    const cursor = collection.find({
      slug: TARGET_SLUG
    });

    const operations: AnyBulkWriteOperation<MongoDocument>[] = [];

    for await (const document of cursor) {
      const { $set, $unset } =
        direction === 'up'
          ? collectUpUpdates(document, migrationMap)
          : collectDownUpdates(document, migrationMap);

      const update = createUpdateFilter($set, $unset);

      if (!update) {
        continue;
      }

      operations.push({
        updateOne: {
          filter: { _id: document._id },
          update
        }
      });
    }

    if (operations.length === 0) {
      continue;
    }

    await collection.bulkWrite(operations, {
      ordered: false
    });
  }
}

export async function up(db: Db): Promise<void> {
  await normalizeAboutUsImageSrcs(db, 'up');
}

export async function down(db: Db): Promise<void> {
  await normalizeAboutUsImageSrcs(db, 'down');
}