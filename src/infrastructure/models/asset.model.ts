import { type InferSchemaType, type Model, model, Schema, Types } from 'mongoose';

const usageRefSchema = new Schema(
  {
    pageId: { type: String, required: false, index: true },
    blockId: { type: String, required: false, trim: true }
  },
  { _id: false }
);

const assetSchema = new Schema(
  {
    type: { type: String, required: true, enum: ['image', 'pdf', 'audio'], index: true },
    tags: {
      type: [String],
      enum: ['page', 'news', 'events', 'opus'],
      default: []
    },

    usageRefs: { type: [usageRefSchema], default: [] },

    filename: { type: String, required: true, trim: true },

    mimeType: { type: String, required: true, trim: true },
    sizeBytes: { type: Number, required: true, min: 0 },

    url: { type: String, required: true },

    createdBy: { type: Schema.Types.ObjectId, required: false },
    description: { type: String, required: false, trim: true, default: '' },

    isStarred: { type: Boolean, required: true, default: false }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'image_assets'
  }
);

assetSchema.index({ mimeType: 1, createdAt: -1 });
assetSchema.index({ isStarred: 1, createdAt: -1 });
assetSchema.index({ createdAt: -1 });

export type assetDocument = InferSchemaType<typeof assetSchema> & {
  _id: Types.ObjectId;
};

export const assetModel: Model<assetDocument> = model<assetDocument>(
  'ImageAsset',
  assetSchema
) as unknown as Model<assetDocument>;
