import type { Db } from 'mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'foundationinfos';

const DOCUMENT_ID_TO_UPDATE = new ObjectId('683833693008546249bba09e');

const NEW_ADDRESS_DATA = {
  uk: '1054, м. Київ, вул. Б. Хмельницького, 68, кв. 63',
  en: '68 Bohdana Khmelnytskoho St, apt. 63, Kyiv, 1054'
};

export async function up(db: Db): Promise<void> {
  const result = await db
    .collection(COLLECTION_NAME)
    .updateOne({ _id: DOCUMENT_ID_TO_UPDATE }, { $set: { address: NEW_ADDRESS_DATA } });

  if (result.matchedCount === 0) {
    throw new Error(`Migration UP failed: Document with id=${DOCUMENT_ID_TO_UPDATE.toHexString()} not found.`);
  }
}

export async function down(db: Db): Promise<void> {
  const result = await db
    .collection(COLLECTION_NAME)
    .updateOne({ _id: DOCUMENT_ID_TO_UPDATE }, { $unset: { address: '' } });

  if (result.matchedCount === 0) {
    throw new Error(`Migration DOWN failed: Document with id=${DOCUMENT_ID_TO_UPDATE.toHexString()} not found.`);
  }
}
