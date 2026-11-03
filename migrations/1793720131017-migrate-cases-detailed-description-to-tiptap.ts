import type { Db } from 'mongodb';

const COLLECTIONS = 'cases';

export async function up(db: Db): Promise<void> {
  const casesCollection = db.collection(COLLECTIONS);
  const cases = await casesCollection.find({}).toArray();

  for (const caseItem of cases) {
    const oldDescription = caseItem.detailedCaseDescription;

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
      if ('uk' in oldDescription || 'en' in oldDescription) {
        const ukVal = oldDescription.uk;
        const enVal = oldDescription.en;

        newUk = typeof ukVal === 'object' && ukVal !== null ? ukVal : createTiptapDoc(ukVal);
        newEn = typeof enVal === 'object' && enVal !== null ? enVal : createTiptapDoc(enVal);
      } else if ('type' in oldDescription && oldDescription.type === 'doc') {
        newUk = oldDescription;
        newEn = oldDescription;
      }
    } else if (typeof oldDescription === 'string') {
      newUk = createTiptapDoc(oldDescription);
      newEn = createTiptapDoc(oldDescription);
    }

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
  }
}

export async function down(db: Db): Promise<void> {
  const casesCollection = db.collection(COLLECTIONS);
  const cases = await casesCollection.find({}).toArray();

  for (const caseItem of cases) {
    const desc = caseItem.detailedCaseDescription;
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
  }
}
