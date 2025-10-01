import { Db } from 'mongodb';

const TARGET_COLLECTION = 'compositions';

export async function up(db: Db): Promise<void> {
  const compositions = db.collection(TARGET_COLLECTION);
  await compositions.updateMany({}, { $set: { categories: [] } });
}

export async function down(db: Db): Promise<void> {
  const compositions = db.collection(TARGET_COLLECTION);
  await compositions.updateMany({}, { $unset: { categories: '' } });
}
