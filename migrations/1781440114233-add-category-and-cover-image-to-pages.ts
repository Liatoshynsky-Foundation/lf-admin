import { Db } from 'mongodb';

export async function up(db: Db): Promise<void> {
  await db.collection('pages').updateMany(
    { category: { $exists: false } }, 
    {
      $set: {
        category: 'other', 
        coverImage: {
          src: '/images/image.jpg',
          alt: { uk: 'Зображення', en: 'Image' },
          caption: { uk: '', en: '' },
          isTmp: false
        }
      }
    }
  );
}

export async function down(db: Db): Promise<void> {
  await db.collection('pages').updateMany(
    {}, 
    { $unset: { category: '', coverImage: '' } }
  );
}
