import type { Connection } from 'mongoose';

const recalculateDescriptionsCount = async (
  connection: Connection,
  onlyWithDetailedDescription: boolean
): Promise<void> => {
  const funds = connection.collection('funds');
  const cases = connection.collection('cases');

  for await (const fund of funds.find({}, { projection: { _id: 1 } })) {
    const filter = {
      fundId: fund._id,
      ...(onlyWithDetailedDescription
        ? { 'detailedCaseDescription.uk': { $exists: true, $nin: ['', null] } }
        : {})
    };
    const descriptionNumbers = await cases.distinct('descriptionNumber', filter);

    await funds.updateOne(
      { _id: fund._id },
      { $set: { numberOfDescriptions: descriptionNumbers.length } }
    );
  }
};

export async function up(connection: Connection): Promise<void> {
  await recalculateDescriptionsCount(connection, false);
}

export async function down(connection: Connection): Promise<void> {
  // Restore the previous counting rule using the current cases.
  await recalculateDescriptionsCount(connection, true);
}
