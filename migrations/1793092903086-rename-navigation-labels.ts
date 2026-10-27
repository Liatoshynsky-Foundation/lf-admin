import type { Db } from 'mongodb';

const COLLECTION = 'navigations';

const RESEARCH_HREF = '/research';
const ARTISTRY_HREF = '/artistry';

const OLD_RESEARCH_LABELS = {
  uk: 'Дослідження та наукові роботи',
  en: 'Research and Academic Works'
};

const NEW_RESEARCH_LABELS = {
  uk: 'Бібліографія',
  en: 'Bibliography'
};

const OLD_ARTISTRY_LABEL = 'Artistry';
const NEW_ARTISTRY_LABEL = 'Works';

export async function up(db: Db): Promise<void> {
  const navigation = db.collection(COLLECTION);

  const document = await navigation.findOne({
    'links.href': { $in: [RESEARCH_HREF, ARTISTRY_HREF] }
  });

  if (!document) {
    throw new Error('Navigation document containing the target links was not found');
  }

  const researchLink = document.links?.find((link: { href?: string }) => link.href === RESEARCH_HREF);

  const artistryLink = document.links?.find((link: { href?: string }) => link.href === ARTISTRY_HREF);

  if (!researchLink) {
    throw new Error(`Navigation link ${RESEARCH_HREF} was not found`);
  }

  if (!artistryLink) {
    throw new Error(`Navigation link ${ARTISTRY_HREF} was not found`);
  }

  const result = await navigation.updateOne(
    { _id: document._id },
    {
      $set: {
        'links.$[research].label.uk': NEW_RESEARCH_LABELS.uk,
        'links.$[research].label.en': NEW_RESEARCH_LABELS.en,
        'links.$[artistry].label.en': NEW_ARTISTRY_LABEL
      },
      $currentDate: {
        updatedAt: true
      }
    },
    {
      arrayFilters: [{ 'research.href': RESEARCH_HREF }, { 'artistry.href': ARTISTRY_HREF }]
    }
  );

  if (result.matchedCount === 0) {
    throw new Error('Navigation document was not updated');
  }
}

export async function down(db: Db): Promise<void> {
  const navigation = db.collection(COLLECTION);

  const result = await navigation.updateOne(
    {
      $and: [{ 'links.href': RESEARCH_HREF }, { 'links.href': ARTISTRY_HREF }]
    },
    {
      $set: {
        'links.$[research].label.uk': OLD_RESEARCH_LABELS.uk,
        'links.$[research].label.en': OLD_RESEARCH_LABELS.en,
        'links.$[artistry].label.en': OLD_ARTISTRY_LABEL
      },
      $currentDate: {
        updatedAt: true
      }
    },
    {
      arrayFilters: [{ 'research.href': RESEARCH_HREF }, { 'artistry.href': ARTISTRY_HREF }]
    }
  );

  if (result.matchedCount === 0) {
    throw new Error('Navigation document containing both target links was not found');
  }
}
