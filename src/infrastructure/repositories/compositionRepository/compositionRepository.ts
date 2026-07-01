import mongoose, { Model } from 'mongoose';

import { Composition } from '~/domain/entities/Composition';
import { CompositionInput, ICompositionRepository } from '~/domain/repositories/compositionRepository';
import dbConnect from '~/infrastructure/db/connect';

export type DbComposition = {
  _id: { toString(): string };
  opusId?: { toString(): string } | null;
  order?: number | null;
  title: Composition['title'];
  year?: number | null;
  genre?: string | null;
  genres?: Array<{ toString(): string }>;
  categories?: Array<{ toString(): string }>;
  audioAvailable?: boolean;
  sheetAvailable?: boolean;
  sheetMusic: Composition['sheetMusic'];
  audios: Composition['audios'];
  createdAt: string;
  updatedAt: string;
};

type CompositionRepoDeps = Readonly<{
  CompositionModel: Model<DbComposition>;
}>;

const toEntity = (doc: DbComposition): Composition => ({
  id: doc._id.toString(),
  opusId: doc.opusId ? doc.opusId.toString() : null,
  order: doc.order ?? 0,
  title: doc.title,
  year: doc.year ?? undefined,
  genre: doc.genre ?? undefined,
  genres: (doc.genres ?? []).map((value) => value.toString()),
  categories: (doc.categories ?? []).map((value) => value.toString()),
  audioAvailable: doc.audioAvailable ?? false,
  sheetAvailable: doc.sheetAvailable ?? false,
  sheetMusic: doc.sheetMusic ?? [],
  audios: doc.audios ?? [],
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt
});

export const CompositionRepository = ({ CompositionModel }: CompositionRepoDeps): ICompositionRepository => {
  const findByOpusId = async (opusId: string): Promise<Composition[]> => {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(opusId)) {
      return [];
    }

    const docs = await CompositionModel.find({ opusId }).sort({ order: 1, _id: 1 }).lean<DbComposition[]>();
    return docs.map(toEntity);
  };

  const deleteByOpusId = async (opusId: string): Promise<void> => {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(opusId)) {
      return;
    }

    await CompositionModel.deleteMany({ opusId });
  };

  // Reconcile an opus's compositions WITHOUT duplicating rows:
  //  - rows with an `id` update/link the existing composition (reassign opusId),
  //  - rows without an `id` create a new composition,
  //  - compositions previously under this opus but dropped from the form are
  //    unlinked (opusId -> null, i.e. they become "ungrouped"), never duplicated.
  const syncForOpus = async (opusId: string, inputs: CompositionInput[]): Promise<Composition[]> => {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(opusId)) {
      return [];
    }

    const keepIds = inputs
      .map((input) => input.id)
      .filter((id): id is string => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id));

    await CompositionModel.updateMany({ opusId, _id: { $nin: keepIds } }, { $set: { opusId: null } });

    const results: Composition[] = [];

    for (let index = 0; index < inputs.length; index += 1) {
      const { id, ...fields } = inputs[index];

      if (id && mongoose.Types.ObjectId.isValid(id)) {
        const updated = await CompositionModel.findByIdAndUpdate(
          id,
          { ...fields, opusId, order: index },
          { new: true }
        ).lean<DbComposition>();

        if (updated) {
          results.push(toEntity(updated));
        }
      } else {
        const created = await new CompositionModel({ ...fields, opusId, order: index }).save();
        results.push(toEntity(created.toObject() as unknown as DbComposition));
      }
    }

    return results;
  };

  const searchByTitle = async (search: string): Promise<Composition[]> => {
    await dbConnect();

    const trimmed = search.trim();

    if (!trimmed) {
      return [];
    }

    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

    const docs = await CompositionModel.find({
      $or: [
        { 'title.uk': { $regex: escaped, $options: 'i' } },
        { 'title.en': { $regex: escaped, $options: 'i' } }
      ]
    })
      .limit(10)
      .lean<DbComposition[]>();

    return docs.map(toEntity);
  };

  return { findByOpusId, syncForOpus, deleteByOpusId, searchByTitle };
};
