import mongoose from 'mongoose';

export const translatedFieldSchema = new mongoose.Schema(
  {
    uk: { type: String, required: true },
    en: { type: String, required: true }
  },
  { _id: false }
);

export const translatedBooleanSchema = new mongoose.Schema(
  {
    uk: { type: Boolean, required: true, default: true },
    en: { type: Boolean, required: true, default: true }
  },
  { _id: false }
);

export const localizedImageSchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    alt: translatedFieldSchema,
    caption: translatedFieldSchema,
    isTmp: { type: Boolean, default: false },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
  },
  { _id: false }
);

export const baseContentSchemaFields = {
  adminTitle: {
    type: String,
    required: true
  },
  title: {
    type: translatedFieldSchema,
    required: true
  },
  description: {
    type: translatedFieldSchema,
    required: true
  },
  keywords: {
    type: translatedFieldSchema,
    required: true
  },
  allowIndexation: {
    type: translatedBooleanSchema,
    required: true
  },
  slug: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  coverImage: {
    type: localizedImageSchema,
    required: true
  },
  publishedAt: {
    type: Date,
    default: null
  },
  meta: {
    views: {
      type: Number,
      default: 0,
      required: true
    }
  }
};