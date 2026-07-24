import mongoose, { Model, Schema } from 'mongoose';

import { translatedFieldSchema } from './commonSchemas';
import { Composition } from '~/domain/entities/Composition';

const sheetMusicSchema = new Schema(
  {
    url: { type: String, required: true },
    name: { type: String, default: null },
    publishDate: { type: String, default: null },
    isFree: { type: Boolean, default: false },
    dateUploaded: { type: Date, default: Date.now }
  },
  { _id: false }
);

const compositionAudioSchema = new Schema(
  {
    name: { type: String, default: null },
    url: { type: String, default: null }
  },
  { _id: false }
);

const compositionSchema = new Schema(
  {
    name: { type: translatedFieldSchema, required: true },
    year: { type: Number, default: null },
    genre: { type: String, default: null },
    audioAvailable: { type: Boolean, default: false },
    sheetAvailable: { type: Boolean, default: false },
    sheetMusic: { type: [sheetMusicSchema], default: [] },
    audios: { type: [compositionAudioSchema], default: [] }
  },
  { timestamps: true, collection: 'compositions' }
);

const CompositionModel: Model<Composition> =
  mongoose.models.Composition || mongoose.model<Composition>('Composition', compositionSchema);

export default CompositionModel;
