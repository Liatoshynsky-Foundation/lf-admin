import { Model, Types } from 'mongoose';

import dbConnect from '~/infrastructure/db/connect';
import type { PaymentDetails, PaymentDetailsPdfFile,PaymentDetailsTab } from '~/src/domain/entities/PaymentDetails';
import {
  CreatePaymentDetailsTabInput,
  IPaymentDetailsRepository,
  ReorderPaymentDetailsTabsInput,
  UpdatePaymentDetailsTabInput
} from '~/src/domain/repositories/PaymentDetailsRepository';

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

const updatePdfFile = async (PaymentDetailsModel: Model<DbPaymentDetails>, pdfFile: PaymentDetailsPdfFile | null) => {
  const updated = await PaymentDetailsModel.findOneAndUpdate(
    { slug: PAYMENT_DETAILS_SLUG },
    { $set: { pdfFile } },
    { new: true, runValidators: true }
  )
    .lean<DbPaymentDetails>()
    .exec();
  if (!updated) {
    throw new Error(`Payment details not found: slug="${PAYMENT_DETAILS_SLUG}"`);
  }
  return toEntity(updated);
};

export const PaymentDetailsRepository = ({
  PaymentDetailsModel
}: PaymentDetailsRepoDeps): IPaymentDetailsRepository => ({
  getPaymentDetails: async (): Promise<PaymentDetails | null> => {
    await dbConnect();

    const doc = await PaymentDetailsModel.findOne({ slug: PAYMENT_DETAILS_SLUG }).lean<DbPaymentDetails>().exec();

    if (!doc) return null;

    return toEntity(doc);
  },
  addPaymentDetailsTab: async (input: CreatePaymentDetailsTabInput): Promise<PaymentDetails> => {
    await dbConnect();

    const paymentDetails = await PaymentDetailsModel.findOne({ slug: PAYMENT_DETAILS_SLUG }).exec();

    if (!paymentDetails) {
      const created = await PaymentDetailsModel.create({
        slug: PAYMENT_DETAILS_SLUG,
        tabs: [
          {
            _id: new Types.ObjectId(),
            name: input.name,
            content: input.content,
            order: 0
          }
        ],
        pdfFile: null
      });
      return toEntity(created.toObject() as unknown as DbPaymentDetails);
    }
    const nextOrder = paymentDetails.tabs.length > 0 ? Math.max(...paymentDetails.tabs.map((tab) => tab.order)) + 1 : 0;
    const newTab: DbPaymentDetailsTab = {
      _id: new Types.ObjectId(),
      name: input.name,
      content: input.content,
      order: nextOrder
    };
    paymentDetails.tabs.push(newTab);

    const updated = await paymentDetails.save();
    return toEntity(updated.toObject() as unknown as DbPaymentDetails);
  },

  updatePaymentDetailsTab: async (tabId: string, input: UpdatePaymentDetailsTabInput): Promise<PaymentDetails> => {
    await dbConnect();
    if (!Types.ObjectId.isValid(tabId)) {
      throw new Error(`Invalid payment details tabId: "${tabId}"`);
    }

    const $set: Record<string, unknown> = {};
    if (input.name !== undefined) {
      $set['tabs.$.name'] = input.name;
    }
    if (input.content !== undefined) {
      $set['tabs.$.content'] = input.content;
    }
    if (Object.keys($set).length === 0) {
      const existing = await PaymentDetailsModel.findOne({ slug: PAYMENT_DETAILS_SLUG })
        .lean<DbPaymentDetails>()
        .exec();
      if (!existing) {
        throw new Error(`Payment details not found: slug="${PAYMENT_DETAILS_SLUG}"`);
      }
      return toEntity(existing);
    }

    const updated = await PaymentDetailsModel.findOneAndUpdate(
      { slug: PAYMENT_DETAILS_SLUG, 'tabs._id': new Types.ObjectId(tabId) },
      { $set },
      { new: true, runValidators: true }
    )
      .lean<DbPaymentDetails>()
      .exec();
    if (!updated) {
      throw new Error(`Payment details tab not found: tabId="${tabId}"`);
    }

    return toEntity(updated);
  },
  removePaymentDetailsTab: async (tabId: string): Promise<PaymentDetails> => {
    await dbConnect();
    if (!Types.ObjectId.isValid(tabId)) {
      throw new Error(`Invalid payment details tabId: "${tabId}"`);
    }

    const paymentDetails = await PaymentDetailsModel.findOne({ slug: PAYMENT_DETAILS_SLUG }).exec();
    if (!paymentDetails) {
      throw new Error(`Payment details not found: slug="${PAYMENT_DETAILS_SLUG}"`);
    }

    const tabIndex = paymentDetails.tabs.findIndex((tab) => tab._id.toString() === tabId);
    if (tabIndex === -1) {
      throw new Error(`Payment details tab not found: tabId="${tabId}"`);
    }
    if (paymentDetails.tabs.length === 1) {
      throw new Error(`Cannot delete the last payment details tab: tabId="${tabId}"`);
    }
    paymentDetails.tabs.splice(tabIndex, 1);

    paymentDetails.tabs.forEach((tab, index) => {
      tab.order = index;
    });

    const updated = await paymentDetails.save();
    return toEntity(updated.toObject() as unknown as DbPaymentDetails);
  },
  reorderPaymentDetailsTabs: async (input: ReorderPaymentDetailsTabsInput): Promise<PaymentDetails> => {
    await dbConnect();

    const paymentDetails = await PaymentDetailsModel.findOne({ slug: PAYMENT_DETAILS_SLUG }).exec();

    if (!paymentDetails) {
      throw new Error(`Payment details not found: slug="${PAYMENT_DETAILS_SLUG}"`);
    }

    const existingTabIds = paymentDetails.tabs.map((tab) => tab._id.toString());
    const existingTabIdSet = new Set(existingTabIds);
    const orderedTabIdSet = new Set(input.orderedTabIds);

    const isValidOrder =
      input.orderedTabIds.length === existingTabIds.length &&
      orderedTabIdSet.size === existingTabIdSet.size &&
      [...existingTabIdSet].every((id) => orderedTabIdSet.has(id));

    if (!isValidOrder) {
      throw new Error('Invalid orderedTabIds: must contain all existing tab IDs exactly once');
    }

    paymentDetails.tabs.forEach((tab) => {
      tab.order = input.orderedTabIds.indexOf(tab._id.toString());
    });

    const updated = await paymentDetails.save();
    return toEntity(updated.toObject() as unknown as DbPaymentDetails);
  },
  addPaymentDetailsPdfFile: async (pdfFile: PaymentDetailsPdfFile): Promise<PaymentDetails> => {
    await dbConnect();
    return await updatePdfFile(PaymentDetailsModel, pdfFile);
  },

  removePaymentDetailsPdfFile: async (): Promise<PaymentDetails> => {
    await dbConnect();
    return await updatePdfFile(PaymentDetailsModel, null);
  }
});
