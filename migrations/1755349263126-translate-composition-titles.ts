import { Db } from 'mongodb';

const titleMap: Record<string, string> = {
  "Пісня": "Song",
  "Ноктюрн": "Nocturne",
  "Симфонія №3 B-moll": "Symphony No.3 in B minor",
  "Елегія": "Elegy",
  "Соната для скрипки": "Violin Sonata",
  "Прелюдія світанку": "Prelude of Dawn",
  "Етюд": "Etude",
  "Ода невідомому герою...": "Ode to the Unknown Hero...",
  "Симфонія №1 B-moll": "Symphony No.1 in B minor",
  "Композиція для голосу і фортепіано": "Composition for Voice and Piano",
  "Симфонія №2 B-moll": "Symphony No.2 in B minor",
  "Поема про ліс": "Poem about the Forest",
  "Інструментальна п’єса": "Instrumental Piece",
  "Симфонічний твір": "Symphonic Work",
  "Романтична балада": "Romantic Ballad",
  "«Після бою», сл. І. Буніна, укр. пер. М. Стріхи": "After the Battle, lyrics by I. Bunin, translated by M. Strikha",
  "Мелодія": "Melody",
  "Твір із надзвичайно довгою назвою...": "Work with an Extremely Long Title...",
  "Коротке ім’я": "Short Name",
  "Довше ім’я...": "Longer Name..."
};

export async function up(db: Db) {
  const compositions = db.collection("compositions");

  const allDocs = await compositions.find({}).toArray();

  let migratedCount = 0;

  for (const doc of allDocs) {
    if (!doc.title) {
      console.warn(`Skipping document with _id=${doc._id}: no title found`);
      continue;
    }

    const uaTitle = doc.title;
    const enTitle = titleMap[uaTitle] || "";

    await compositions.updateOne(
      { _id: doc._id },
      { $set: { title: { uk: uaTitle, en: enTitle } } }
    );

    migratedCount++;
  }

}

export async function down(db: Db) {
  const compositions = db.collection("compositions");

  const allDocs = await compositions.find({}).toArray();

  for (const doc of allDocs) {
    const ukTitle = doc.title?.uk || "";
    await compositions.updateOne(
      { _id: doc._id },
      { $set: { title: ukTitle } }
    );
  }

}