import mongoose, { Model, Schema } from 'mongoose';

import { translatedFieldSchema } from './commonSchemas';
import { Category } from '~/domain/entities/Category';

const categorySchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: translatedFieldSchema, required: true }
  },
  { timestamps: true, collection: 'categories' }
);

const CategoryModel: Model<Category> =
  mongoose.models.Category || mongoose.model<Category>('Category', categorySchema);

export default CategoryModel;
