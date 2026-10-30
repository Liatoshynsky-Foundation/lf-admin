import type { Db } from 'mongodb';

import { down } from './1793211922680-seed-payment-details';

jest.mock('mongodb', () => ({
  ObjectId: jest.fn()
}));

describe('1793211922680-seed-payment-details rollback', () => {
  it('does not delete an edited payment details document', async () => {
    const deleteOne = jest.fn();
    const collection = jest.fn().mockReturnValue({ deleteOne });
    const db = { collection } as unknown as Db;

    await down(db);

    expect(collection).not.toHaveBeenCalled();
    expect(deleteOne).not.toHaveBeenCalled();
  });
});
