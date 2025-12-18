import { type InferSchemaType, type Model, model, Schema, Types } from 'mongoose';

export type Locale = 'uk' | 'en';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const cropRectSchema = new Schema<CropRect>(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true, min: 0.0001 },
    height: { type: Number, required: true, min: 0.0001 }
  },
  { _id: false }
);

const imageCropSchema = new Schema(
  {
    imageAssetId: { type: Schema.Types.ObjectId, required: true, ref: 'ImageAsset', index: true },

    cropId: { type: String, required: true, trim: true, index: true },

    pageId: { type: String, required: false, default: null, index: true },
    blockId: { type: String, required: false, default: null, index: true },
    locale: { type: String, required: true, enum: ['uk', 'en'], index: true },

    crop: { type: cropRectSchema, required: true }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'image_crops'
  }
);

imageCropSchema.index(
  { imageAssetId: 1, pageId: 1, blockId: 1, locale: 1 },
  { unique: true, partialFilterExpression: { blockId: { $type: 'string' } } }
);

imageCropSchema.index(
  { imageAssetId: 1, locale: 1, cropId: 1 },
  { unique: true, partialFilterExpression: { pageId: null, blockId: null } }
);

imageCropSchema.index({ imageAssetId: 1, updatedAt: -1 });

export type ImageCropDocument = InferSchemaType<typeof imageCropSchema> & {
  _id: Types.ObjectId;
};

export const ImageCropModel: Model<ImageCropDocument> = model<ImageCropDocument>(
  'ImageCrop',
  imageCropSchema
) as unknown as Model<ImageCropDocument>;
