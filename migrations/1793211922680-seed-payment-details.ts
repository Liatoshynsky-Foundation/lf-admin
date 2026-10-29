import { Db, ObjectId } from 'mongodb';

const PAYMENT_DETAILS_SLUG = 'payment-details';
const COLLECTION = 'paymentdetails';
const MIGRATION_ID = '1793211922680-seed-payment-details';

export async function up(db: Db): Promise<void> {
  const now = new Date();
  const PaymentDetails = db.collection(COLLECTION);

  await PaymentDetails.updateOne(
    { slug: PAYMENT_DETAILS_SLUG },
    {
      $setOnInsert: {
        slug: PAYMENT_DETAILS_SLUG,
        tabs: [
          {
            _id: new ObjectId(),
            name: 'UAH',
            content: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph'
                }
              ]
            },
            order: 0
          }
        ],
        pdfFile: null,
        createdAt: now,
        updatedAt: now,
        _migrationId: MIGRATION_ID
      }
    },
    { upsert: true }
  );
}

export async function down(db: Db): Promise<void> {
  await db.collection(COLLECTION).deleteOne({
    slug: PAYMENT_DETAILS_SLUG,
    _migrationId: MIGRATION_ID
  });
}
