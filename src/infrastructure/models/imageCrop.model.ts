import { type InferSchemaType, type Model, model, models, Schema, Types } from 'mongoose';

export type Locale = 'uk' | 'en';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const cropRectSchema = new Schema<CropRect>(
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
    pageId: { type: String, required: false, default: null, index: true },
    blockId: { type: String, required: false, default: null, index: true },

    cropId: { type: String, required: true, trim: true, index: true },
    locale: { type: String, required: true, enum: ['uk', 'en'], index: true },

    crop: { type: cropRectSchema, required: true }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'image_crops'
  }
);

imageCropSchema.index({ imageAssetId: 1, pageId: 1, locale: 1 }, { unique: true, sparse: true });

export type ImageCropDocument = InferSchemaType<typeof imageCropSchema> & {
  _id: Types.ObjectId;
};

export const ImageCropModel: Model<ImageCropDocument> =
  (models.ImageCrop as unknown as Model<ImageCropDocument>) ||
  (model<ImageCropDocument>('ImageCrop', imageCropSchema) as unknown as Model<ImageCropDocument>);
