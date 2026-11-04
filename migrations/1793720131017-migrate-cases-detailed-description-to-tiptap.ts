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

type DescPayload = {
  uk?: { content?: { content?: { text?: string }[] }[] };
  en?: { content?: { content?: { text?: string }[] }[] };
};

export async function down(db: Db): Promise<void> {
  const casesCollection = db.collection(COLLECTIONS);
  const cases = await casesCollection.find({}).toArray();

  await Promise.all(
    cases.map(async (caseItem) => {
      const desc = caseItem.detailedCaseDescription as DescPayload | undefined | string;
      let fallbackUk = '';
      let fallbackEn = '';

      if (desc && typeof desc === 'object') {
        try {
          fallbackUk = desc.uk?.content?.[0]?.content?.[0]?.text || '';
        } catch {
          fallbackUk = '';
        }
        try {
          fallbackEn = desc.en?.content?.[0]?.content?.[0]?.text || '';
        } catch {
          fallbackEn = '';
        }
      }

      await casesCollection.updateOne(
        { _id: caseItem._id },
        {
          $set: {
            detailedCaseDescription: {
              uk: fallbackUk,
              en: fallbackEn
            },
            updatedAt: new Date()
          }
        }
      );
    })
  );
}
