import mongoose from 'mongoose';

import { cropRectSchema } from './imageCrop.model';

export const translatedFieldSchema = new mongoose.Schema(
  {
    uk: { type: String, required: true },
    en: { type: String, required: true }
  },
  { _id: false }
);

export const metaSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: {
      uk: { type: String },
      en: { type: String }
    },
    canonicalUrl: {
      uk: { type: String },
      en: { type: String }
    },
    metaTitle: {
      uk: { type: String },
      en: { type: String }
    }
  },
  { _id: false }
);

export const descriptionsSchema = new mongoose.Schema(
  {
    uk: { type: String, required: true },
    en: { type: String, required: true },
    meta: metaSchema
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
    crop: { type: cropRectSchema, default: null }
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
    type: descriptionsSchema,
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
