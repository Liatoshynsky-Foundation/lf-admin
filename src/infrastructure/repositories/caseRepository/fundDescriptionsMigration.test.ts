/** @jest-environment node */

import { ObjectId } from 'mongodb';
import type { Connection } from 'mongoose';

import { down, up } from '../../../../migrations/1792627200000-recalculate-fund-descriptions-count';

type CaseRecord = {
  fundId: ObjectId;
  descriptionNumber: number;
  status: string;
  detailedCaseDescription?: { uk: string | null };
};

const createDatabase = () => {
  const funds = [
    { _id: new ObjectId(), numberOfDescriptions: 0, numberOfCases: 9 },
    { _id: new ObjectId(), numberOfDescriptions: 2, numberOfCases: 9 },
    { _id: new ObjectId(), numberOfDescriptions: 4, numberOfCases: 0 }
  ];
  const cases: CaseRecord[] = [
    ...[1, 3, 4, 5, 6, 8, 12, 14, 1].map((descriptionNumber) => ({
      fundId: funds[0]._id,
      descriptionNumber,
      status: 'hidden'
    })),
    ...[1, 3, 4, 5, 6, 7, 9, 11, 12].map((descriptionNumber) => ({
      fundId: funds[1]._id,
      descriptionNumber,
      status: 'published',
      detailedCaseDescription: { uk: descriptionNumber <= 3 ? 'Опис' : '' }
    }))
  ];
  cases[0].detailedCaseDescription = { uk: null };
  cases[1].detailedCaseDescription = { uk: '' };

  const distinct = jest.fn(async (_field: string, filter: Record<string, unknown>) => {
    const matchingCases = cases.filter((item) =>
      item.fundId.equals(filter.fundId as ObjectId) &&
      (!filter['detailedCaseDescription.uk'] || Boolean(item.detailedCaseDescription?.uk))
    );
    return [...new Set(matchingCases.map((item) => item.descriptionNumber))];
  });
  const updateOne = jest.fn(async (
    filter: { _id: ObjectId },
    update: { $set: { numberOfDescriptions: number } }
  ) => {
    const fund = funds.find((item) => item._id.equals(filter._id));
    if (fund) Object.assign(fund, update.$set);
  });
  const collections = {
    funds: { find: () => funds, updateOne },
    cases: { distinct }
  };
  const connection = {
    collection: (name: keyof typeof collections) => collections[name]
  } as unknown as Connection;

  return { connection, funds, cases, distinct };
};

describe('fund descriptions count migration', () => {
  it('repairs existing counts using unique series across all cases, including hidden cases without descriptions', async () => {
    const { connection, funds, distinct } = createDatabase();

    await up(connection);

    expect(funds.map((fund) => fund.numberOfDescriptions)).toEqual([8, 9, 0]);
    expect(funds.map((fund) => fund.numberOfCases)).toEqual([9, 9, 0]);
    for (const fund of funds) {
      expect(distinct).toHaveBeenCalledWith('descriptionNumber', { fundId: fund._id });
    }
  });

  it('can be rerun and reflects series changes and deleted cases', async () => {
    const { connection, funds, cases } = createDatabase();

    await up(connection);
    await up(connection);
    expect(funds.map((fund) => fund.numberOfDescriptions)).toEqual([8, 9, 0]);

    cases[1].descriptionNumber = 1;
    cases.splice(0, 1);
    await up(connection);
    expect(funds.map((fund) => fund.numberOfDescriptions)).toEqual([7, 9, 0]);
  });

  it('restores the previous detailed-description counting rule on rollback', async () => {
    const { connection, funds } = createDatabase();

    await up(connection);
    await down(connection);

    expect(funds.map((fund) => fund.numberOfDescriptions)).toEqual([0, 2, 0]);
  });
});
