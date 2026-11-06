import mongoose, { Model, Schema } from 'mongoose';

import type { PaymentDetails } from '~/src/domain/entities/PaymentDetails';

const paymentDetailsPdfFileSchema = new Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true }
  },
  { _id: false }
);

const paymentDetailsTabSchema = new Schema({
  name: { type: String, required: true, trim: true },
  content: { type: Schema.Types.Mixed, required: true },
  order: { type: Number, required: true }
});

const paymentDetailsSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    tabs: { type: [paymentDetailsTabSchema], required: true },
    pdfFile: { type: paymentDetailsPdfFileSchema, default: null }
  },
  {
    timestamps: true,
    collection: 'paymentdetails'
  }
);

const PaymentDetailsModel: Model<PaymentDetails> =
  mongoose.models.PaymentDetails || mongoose.model<PaymentDetails>('PaymentDetails', paymentDetailsSchema);

export default PaymentDetailsModel;
