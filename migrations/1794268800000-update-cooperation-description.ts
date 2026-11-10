import type { Db } from 'mongodb';

const COLLECTIONS = ['pages', 'draftpages'];
const DESCRIPTION_PATH = 'blocks.partnershipFormats.descriptionText';
const BACKUP_PATH = '_migration1764Description';

const DESCRIPTION = {
  uk: 'Ми відкриті до різних форм співпраці в межах напрямів роботи Фундації. Якщо ви хочете запропонувати спільний проєкт, професійну, ресурсну чи фінансову підтримку, зв’яжіться з нами: напишіть нам на електронну пошту або скористайтеся формою на сайті.',
  en: 'We are open to different forms of collaboration within the Foundation’s areas of work. If you would like to propose a joint project or offer professional, in-kind, or financial support, please get in touch: email us or use the form on our website.'
};

export async function up(db: Db): Promise<void> {
  await Promise.all(
    COLLECTIONS.map((name) =>
      db.collection(name).updateMany(
        {
          slug: 'cooperation',
          'blocks.partnershipFormats': { $type: 'object' },
          [BACKUP_PATH]: { $exists: false }
        },
        [
          {
            $set: {
              // Preserve the original value (including a missing field) for rollback.
              [BACKUP_PATH]: {
                existed: { $ne: [{ $type: `$${DESCRIPTION_PATH}` }, 'missing'] },
                value: { $ifNull: [`$${DESCRIPTION_PATH}`, null] }
              }
            }
          },
          { $set: { [DESCRIPTION_PATH]: { $literal: DESCRIPTION }, updatedAt: '$$NOW' } }
        ]
      )
    )
  );
}

export async function down(db: Db): Promise<void> {
  await Promise.all(
    COLLECTIONS.map((name) =>
      db.collection(name).updateMany(
        {
          slug: 'cooperation',
          [BACKUP_PATH]: { $exists: true },
          // Preserve editor changes made after up(), along with their original backup.
          [DESCRIPTION_PATH]: DESCRIPTION
        },
        [
          {
            $set: {
              [DESCRIPTION_PATH]: {
                $cond: [`$${BACKUP_PATH}.existed`, `$${BACKUP_PATH}.value`, '$$REMOVE']
              },
              updatedAt: '$$NOW'
            }
          },
          { $unset: BACKUP_PATH }
        ]
      )
    )
  );
}
