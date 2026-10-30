import { Model, Types } from 'mongoose';

import dbConnect from '~/infrastructure/db/connect';
import type { PaymentDetails, PaymentDetailsPdfFile, PaymentDetailsTab } from '~/src/domain/entities/PaymentDetails';
import {
  IPaymentDetailsRepository,
  UpdatePaymentDetailsInput} from '~/src/domain/repositories/PaymentDetailsRepository';

type PaymentDetailsRepoDeps = Readonly<{
  PaymentDetailsModel: Model<DbPaymentDetails>;
}>;

export type DbPaymentDetailsTab = {
  _id: Types.ObjectId;
  name: string;
  content: PaymentDetailsTab['content'];
  order: number;
};

export type DbPaymentDetails = {
  _id: Types.ObjectId;
  slug: PaymentDetails['slug'];
  tabs: DbPaymentDetailsTab[];
  pdfFile: PaymentDetailsPdfFile | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const toIso = (d: Date | string): string => (d instanceof Date ? d.toISOString() : d);

const toEntity = (doc: DbPaymentDetails): PaymentDetails => ({
  id: doc._id.toString(),
  slug: doc.slug,
  tabs: [...doc.tabs]
    .sort((a, b) => a.order - b.order)
    .map((tab) => ({
      id: tab._id.toString(),
      name: tab.name,
      content: tab.content,
      order: tab.order
    })),
  pdfFile: doc.pdfFile,
  createdAt: toIso(doc.createdAt),
  updatedAt: toIso(doc.updatedAt)
});

const PAYMENT_DETAILS_SLUG = 'payment-details';

const getBySlug = async (model: Model<DbPaymentDetails>, slug: string): Promise<PaymentDetails | null> => {
  await dbConnect();
  const doc = await model.findOne({ slug }).lean<DbPaymentDetails>().exec();
  return doc ? toEntity(doc) : null;
};

export const PaymentDetailsRepository = ({
  PaymentDetailsModel
}: PaymentDetailsRepoDeps): IPaymentDetailsRepository => ({
  getPaymentDetails: async (): Promise<PaymentDetails | null> => {
    return getBySlug(PaymentDetailsModel, PAYMENT_DETAILS_SLUG);
  },
  updatePaymentDetails: async (input: UpdatePaymentDetailsInput): Promise<PaymentDetails> => {
    await dbConnect();

    if (input.tabs.length === 0) {
      throw new Error('Payment details must contain at least one tab');
    }

    const existingIds = input.tabs.map((tab) => tab.id).filter((id): id is string => id !== undefined);

    if (existingIds.some((id) => !Types.ObjectId.isValid(id))) {
      throw new Error('Payment details contains an invalid tab ID');
    }

    if (new Set(existingIds).size !== existingIds.length) {
      throw new Error('Payment details contains duplicate tab IDs');
    }

    const tabs: DbPaymentDetailsTab[] = input.tabs.map((tab, order) => ({
      _id: tab.id ? new Types.ObjectId(tab.id) : new Types.ObjectId(),
      name: tab.name,
      content: tab.content,
      order
    }));

    const updated = await PaymentDetailsModel.findOneAndUpdate(
      { slug: PAYMENT_DETAILS_SLUG },
      {
        $set: {
          tabs,
          pdfFile: input.pdfFile
        }
      },
      {
        new: true,
        runValidators: true
      }
    )
      .lean<DbPaymentDetails>()
      .exec();

    if (!updated) {
      throw new Error(`Payment details not found: slug="${PAYMENT_DETAILS_SLUG}"`);
    }

    return toEntity(updated);
  }
});
