import type { Db } from 'mongodb';

const COLLECTION = 'assets';
const MIGRATION_ID = '1794493413872-add-main-composition-to-assets';

export const MAIN_COMPOSITION_FIELD = 'isMainComposition';
export const MAIN_COMPOSITION_INDEX = 'unique_main_composition';

export const DEFAULT_MAIN_COMPOSITION_FILENAME = 'Симфонія №4_2частина.mp3';
export const DEFAULT_MAIN_COMPOSITION_URL = `https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/compositions/${DEFAULT_MAIN_COMPOSITION_FILENAME}`;
export const DEFAULT_MAIN_COMPOSITION_SIZE_BYTES = 7908352;

export async function up(db: Db): Promise<void> {
  const assets = db.collection(COLLECTION);

  await assets.createIndex(
    { [MAIN_COMPOSITION_FIELD]: 1 },
    {
      name: MAIN_COMPOSITION_INDEX,
      unique: true,
      partialFilterExpression: { [MAIN_COMPOSITION_FIELD]: true }
    }
  );

  const currentMain = await assets.findOne({ [MAIN_COMPOSITION_FIELD]: true });
  if (currentMain) return;

  const existingDefault = await assets.findOne({
    type: 'audio',
    $or: [{ url: DEFAULT_MAIN_COMPOSITION_URL }, { filename: DEFAULT_MAIN_COMPOSITION_FILENAME }]
  });

  if (existingDefault) {
    await assets.updateOne({ _id: existingDefault._id }, { $set: { [MAIN_COMPOSITION_FIELD]: true } });
    return;
  }

  const now = new Date();
  await assets.insertOne({
    type: 'audio',
    tags: [],
    usageRefs: [],
    filename: DEFAULT_MAIN_COMPOSITION_FILENAME,
    originalname: DEFAULT_MAIN_COMPOSITION_FILENAME,
    mimeType: 'audio/mpeg',
    sizeBytes: DEFAULT_MAIN_COMPOSITION_SIZE_BYTES,
    url: DEFAULT_MAIN_COMPOSITION_URL,
    description: '',
    isStarred: false,
    [MAIN_COMPOSITION_FIELD]: true,
    createdAt: now,
    updatedAt: now,
    _migrationId: MIGRATION_ID
  });
}

export async function down(_db: Db): Promise<void> {
  // Intentionally empty: the main composition must always exist
}
