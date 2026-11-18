import { type Db, ObjectId } from 'mongodb';

const TARGET_COLLECTIONS = ['pages', 'draftpages'];
const BIOGRAPHY_SLUG = 'biography';

export const BIOGRAPHY_HERO_TITLE = { uk: 'Життєпис', en: 'Biography' };

type BiographySection = { id?: string } & Record<string, unknown>;
type BiographyYear = { id?: string; items?: BiographySection[] } & Record<string, unknown>;

type BiographyBlocks = {
  heroSection?: { title?: unknown } & Record<string, unknown>;
  biographyContent?: BiographyYear[];
};

const createId = () => new ObjectId().toString();

const withId = <T extends { id?: string }>(item: T): T => (item.id ? item : { ...item, id: createId() });

export const addBiographyIds = (biographyContent: BiographyYear[] = []): BiographyYear[] =>
  biographyContent.map((year) => ({
    ...withId(year),
    items: (year.items ?? []).map(withId)
  }));

const hasMissingIds = (biographyContent: BiographyYear[] = []) =>
  biographyContent.some((year) => !year.id || (year.items ?? []).some((item) => !item.id));

export async function up(db: Db): Promise<void> {
  for (const collectionName of TARGET_COLLECTIONS) {
    const collection = db.collection(collectionName);
    const page = await collection.findOne<{ blocks?: BiographyBlocks }>({ slug: BIOGRAPHY_SLUG });
    const blocks = page?.blocks;

    if (!blocks) continue;

    const $set: Record<string, unknown> = {};

    if (hasMissingIds(blocks.biographyContent)) {
      $set['blocks.biographyContent'] = addBiographyIds(blocks.biographyContent);
    }

    if (blocks.heroSection && !blocks.heroSection.title) {
      $set['blocks.heroSection.title'] = BIOGRAPHY_HERO_TITLE;
    }

    if (Object.keys($set).length > 0) {
      await collection.updateOne({ slug: BIOGRAPHY_SLUG }, { $set });
    }
  }
}

export async function down(_db: Db): Promise<void> {
  // Intentionally empty: IDs and the hero title are used by the admin editor and the client,
  // so removing them could break content edited after this migration.
}