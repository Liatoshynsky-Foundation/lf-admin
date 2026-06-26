import mongoose, { Model, Schema } from 'mongoose';

import { translatedFieldSchema } from './commonSchemas';
import { Genre } from '~/domain/entities/Genre';

const genreSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: translatedFieldSchema, required: true }
  },
  { timestamps: true, collection: 'genres' }
);

const GenreModel: Model<Genre> = mongoose.models.Genre || mongoose.model<Genre>('Genre', genreSchema);

export default GenreModel;
