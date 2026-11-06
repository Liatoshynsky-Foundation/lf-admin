import { Model, Types } from 'mongoose';

import { paymentDetails, paymentDetailsContent, paymentDetailsPdfFile, updatePaymentDetailsInput } from './__mock__/paymentDetails';
import { DbPaymentDetails, PaymentDetailsRepository } from './paymentDetailsRepository';

jest.mock('mongoose', () => {
  const MockObjectId = function (this: { toString: () => string }, id: string) {
    this.toString = () => id;
  };

  type ObjectIdMock = typeof MockObjectId & { isValid: (id: string) => boolean };

  (MockObjectId as unknown as ObjectIdMock).isValid = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

  return {
    Model: class {},
    Types: {
      ObjectId: MockObjectId
    }
  };
});

jest.mock('~/infrastructure/db/connect', () => jest.fn());

type Query<T> = {
  lean: jest.Mock<Query<T>, []>;
  exec: jest.Mock<Promise<T>, []>;
};

const query = <T>(value: T): Query<T> => {
  const result = {
    lean: jest.fn<Query<T>, []>(),
    exec: jest.fn<Promise<T>, []>().mockResolvedValue(value)
  };

  result.lean.mockReturnValue(result);
  return result;
};

const rejectedQuery = <T>(error: Error): Query<T> => {
  const result = {
    lean: jest.fn<Query<T>, []>(),
    exec: jest.fn<Promise<T>, []>().mockRejectedValue(error)
  };

  result.lean.mockReturnValue(result);
  return result;
};

const findOneMock = jest.fn();
const findOneAndUpdateMock = jest.fn();

describe('PaymentDetailsRepository', () => {
  const MockPaymentDetailsModel = jest.fn().mockImplementation(() => ({})) as unknown as Model<DbPaymentDetails>;

  Object.assign(MockPaymentDetailsModel, {
    findOne: findOneMock,
    findOneAndUpdate: findOneAndUpdateMock
  });

  const repository = PaymentDetailsRepository({ PaymentDetailsModel: MockPaymentDetailsModel });

  const mockAndFetchPaymentDetails = (overrides: Partial<DbPaymentDetails> = {}) => {
    findOneMock.mockReturnValue(query({ ...paymentDetails, ...overrides }));
    return repository.getPaymentDetails();
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPaymentDetails', () => {
    it('returns Payment Details with tabs sorted by order', async () => {
      const firstTab = paymentDetails.tabs[0]._id;
      const secondTab = paymentDetails.tabs[1]._id;

      const result = await mockAndFetchPaymentDetails({
        tabs: [
          { ...paymentDetails.tabs[1], order: 1 },
          { ...paymentDetails.tabs[0], order: 0 }
        ],
        pdfFile: null
      });

      expect(result).toEqual({
        id: paymentDetails._id.toString(),
        slug: 'payment-details',
        tabs: [
          {
            id: firstTab.toString(),
            name: 'UAH',
            content: paymentDetailsContent,
            order: 0
          },
          {
            id: secondTab.toString(),
            name: 'EUR',
            content: paymentDetailsContent,
            order: 1
          }
        ],
        pdfFile: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z'
      });
      expect(findOneMock).toHaveBeenCalledWith({ slug: 'payment-details' });
    });

    it('returns null when the document is missing', async () => {
      findOneMock.mockReturnValue(query(null));

      await expect(repository.getPaymentDetails()).resolves.toBeNull();
    });

    it('maps the shared PDF reference', async () => {
      const result = await mockAndFetchPaymentDetails();

      expect(result?.pdfFile).toEqual(paymentDetailsPdfFile);
    });
  });

  describe('updatePaymentDetails', () => {
    it('updates all tabs and the shared PDF in one operation', async () => {
      findOneAndUpdateMock.mockReturnValue(query(paymentDetails));

      const result = await repository.updatePaymentDetails(updatePaymentDetailsInput);

      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { slug: 'payment-details' },
        expect.objectContaining({
          $set: expect.objectContaining({
            pdfFile: paymentDetailsPdfFile
          })
        }),
        { new: true, runValidators: true }
      );

      const [, update] = findOneAndUpdateMock.mock.calls[0];
      expect(update.$set.tabs).toHaveLength(2);
      expect(update.$set.tabs.map((tab: DbPaymentDetails['tabs'][number]) => ({
        id: tab._id.toString(),
        name: tab.name,
        content: tab.content,
        order: tab.order
      }))).toEqual([
        {
          id: paymentDetails.tabs[0]._id.toString(),
          name: 'UAH',
          content: paymentDetailsContent,
          order: 0
        },
        {
          id: paymentDetails.tabs[1]._id.toString(),
          name: 'EUR',
          content: paymentDetailsContent,
          order: 1
        }
      ]);
      expect(result.tabs.map((tab) => tab.id)).toEqual(
        paymentDetails.tabs.map((tab) => tab._id.toString())
      );
    });

    it('derives tab order from input position', async () => {
      findOneAndUpdateMock.mockReturnValue(query(paymentDetails));

      await repository.updatePaymentDetails({
        tabs: [
          {
            id: paymentDetails.tabs[1]._id.toString(),
            name: 'EUR',
            content: paymentDetailsContent
          },
          {
            id: paymentDetails.tabs[0]._id.toString(),
            name: 'UAH',
            content: paymentDetailsContent
          }
        ],
        pdfFile: null
      });

      const [, update] = findOneAndUpdateMock.mock.calls[0];
      expect(update.$set.tabs.map((tab: DbPaymentDetails['tabs'][number]) => ({
        id: tab._id.toString(),
        name: tab.name,
        content: tab.content,
        order: tab.order
      }))).toEqual([
        {
          id: paymentDetails.tabs[1]._id.toString(),
          name: 'EUR',
          content: paymentDetailsContent,
          order: 0
        },
        {
          id: paymentDetails.tabs[0]._id.toString(),
          name: 'UAH',
          content: paymentDetailsContent,
          order: 1
        }
      ]);
    });

    it('generates an ID for a new tab', async () => {
      findOneAndUpdateMock.mockReturnValue(query(paymentDetails));

      await repository.updatePaymentDetails({
        tabs: [
          ...updatePaymentDetailsInput.tabs,
          {
            name: 'GBP',
            content: paymentDetailsContent
          }
        ],
        pdfFile: null
      });

      const [, update] = findOneAndUpdateMock.mock.calls[0];
      expect(update.$set.tabs[2]).toEqual({
        _id: expect.any(Types.ObjectId),
        name: 'GBP',
        content: paymentDetailsContent,
        order: 2
      });
    });

    it.each([
      ['empty tabs', { tabs: [], pdfFile: null }, 'must contain at least one tab'],
      [
        'invalid tab ID',
        {
          tabs: [{ id: 'invalid-id', name: 'UAH', content: paymentDetailsContent }],
          pdfFile: null
        },
        'invalid tab ID'
      ],
      [
        'duplicate tab IDs',
        {
          tabs: [
            { id: paymentDetails.tabs[0]._id.toString(), name: 'UAH', content: paymentDetailsContent },
            { id: paymentDetails.tabs[0]._id.toString(), name: 'EUR', content: paymentDetailsContent }
          ],
          pdfFile: null
        },
        'duplicate tab IDs'
      ]
    ])('rejects %s', async (_description, input, errorMessage) => {
      await expect(repository.updatePaymentDetails(input)).rejects.toThrow(errorMessage);
      expect(findOneAndUpdateMock).not.toHaveBeenCalled();
    });

    it('throws when the seeded document is missing', async () => {
      findOneAndUpdateMock.mockReturnValue(query(null));

      await expect(repository.updatePaymentDetails(updatePaymentDetailsInput)).rejects.toThrow(
        'Payment details not found'
      );
    });

    it('propagates database errors', async () => {
      const databaseError = new Error('database unavailable');
      findOneAndUpdateMock.mockReturnValue(rejectedQuery(databaseError));

      await expect(repository.updatePaymentDetails(updatePaymentDetailsInput)).rejects.toThrow(databaseError);
    });
  });
});
