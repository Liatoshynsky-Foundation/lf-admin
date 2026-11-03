import { Db } from 'mongodb';

const COLLECTION = 'researchworks';

interface TipTapTextNode {
  type: 'text';
  text: string;
}

interface TipTapParagraphNode {
  type: 'paragraph';
  content?: TipTapTextNode[];
}

interface TipTapDoc {
  type: 'doc';
  content: TipTapParagraphNode[];
}

const isTipTapDoc = (value: unknown): value is TipTapDoc => {
  if (!value || typeof value !== 'object') return false;
  const doc = value as Record<string, unknown>;
  return doc.type === 'doc' && Array.isArray(doc.content);
};

const stringToTipTapDoc = (text: string): TipTapDoc => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: text ? [{ type: 'text', text }] : []
    }
  ]
});

const tipTapDocToString = (doc: unknown): string => {
  if (!isTipTapDoc(doc)) return typeof doc === 'string' ? doc : '';
  return doc.content
    .map((p) => p.content?.map((t) => t.text).join('') ?? '')
    .filter(Boolean)
    .join('\n');
};

const convertFieldUp = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;

  if (isTipTapDoc(value)) {
    return JSON.stringify(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
      const parsed = JSON.parse(trimmed);
      if (isTipTapDoc(parsed)) return trimmed;
    } catch {}

    return JSON.stringify(stringToTipTapDoc(trimmed));
  }

  return null;
};
const convertFieldDown = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (isTipTapDoc(parsed)) {
        return tipTapDocToString(parsed);
      }
    } catch {
      return value;
    }
  }

  if (isTipTapDoc(value)) {
    return tipTapDocToString(value);
  }

  return null;
};

export async function up(db: Db): Promise<void> {
  const collection = db.collection(COLLECTION);
  const cursor = collection.find({});

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (!doc) continue;

    const updatedBibliographic = convertFieldUp(doc.bibliographicDescription);
    const updatedAuthor = convertFieldUp(doc.author);
    const updatedKeywords = convertFieldUp(doc.keywords);

    await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          bibliographicDescription: updatedBibliographic ?? '',
          author: updatedAuthor ?? '',
          keywords: updatedKeywords,
          updatedAt: new Date()
        }
      }
    );
  }
}

export async function down(db: Db): Promise<void> {
  const collection = db.collection(COLLECTION);
  const cursor = collection.find({});

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (!doc) continue;

    await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          bibliographicDescription: convertFieldDown(doc.bibliographicDescription) ?? '',
          author: convertFieldDown(doc.author) ?? '',
          keywords: convertFieldDown(doc.keywords),
          updatedAt: new Date()
        }
      }
    );
  }
}
