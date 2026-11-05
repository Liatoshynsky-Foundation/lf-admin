import type { Db } from 'mongodb';

const COLLECTIONS = 'cases';

function getNewDescriptions(oldDescription: unknown) {
  const createTiptapDoc = (text: unknown) => {
    if (typeof text !== 'string' || text.trim() === '') return null;
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text }]
        }
      ]
    };
  };

  let newUk = null;
  let newEn = null;

  if (oldDescription && typeof oldDescription === 'object') {
    const descRecord = oldDescription as Record<string, unknown>;

    if ('uk' in descRecord || 'en' in descRecord) {
      const ukVal = descRecord.uk;
      const enVal = descRecord.en;

      newUk = typeof ukVal === 'object' && ukVal !== null ? ukVal : createTiptapDoc(ukVal);
      newEn = typeof enVal === 'object' && enVal !== null ? enVal : createTiptapDoc(enVal);
    } else if ('type' in descRecord && descRecord.type === 'doc') {
      newUk = oldDescription;
      newEn = oldDescription;
    }
  } else if (typeof oldDescription === 'string') {
    newUk = createTiptapDoc(oldDescription);
    newEn = createTiptapDoc(oldDescription);
  }

  return { newUk, newEn };
}

export async function up(db: Db): Promise<void> {
  const casesCollection = db.collection(COLLECTIONS);
  const cases = await casesCollection.find({}).toArray();

  await Promise.all(
    cases.map(async (caseItem) => {
      const { newUk, newEn } = getNewDescriptions(caseItem.detailedCaseDescription);

      await casesCollection.updateOne(
        { _id: caseItem._id },
        {
          $set: {
            detailedCaseDescription: {
              uk: newUk,
              en: newEn
            },
            updatedAt: new Date()
          }
        }
      );
    })
  );
}

export async function down(_db: Db): Promise<void> {
  // made no-op,for rollback purposes, use restoration from a backup
}
