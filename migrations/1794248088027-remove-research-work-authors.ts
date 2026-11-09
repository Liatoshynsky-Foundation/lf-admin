import type { Db } from 'mongodb';

const COLLECTION = 'researchworks';

export async function up(db: Db): Promise<void> {
  await db.collection(COLLECTION).updateMany({}, { $unset: { author: '' } });
}

export async function down(_db: Db): Promise<void> {
  // removed author values cannot be restored
}
