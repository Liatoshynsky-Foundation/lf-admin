import mongoose, { Model } from 'mongoose';

import { Composition } from '~/domain/entities/Composition';
import { CompositionFilters, CompositionInput, ICompositionRepository } from '~/domain/repositories/compositionRepository';
import dbConnect from '~/infrastructure/db/connect';

export type DbComposition = {
  _id: { toString(): string };
  opusId?: { toString(): string } | null;
  order?: number | null;
  title: Composition['title'];
  year?: number | null;
  genre?: string | null;
  genres?: Array<{ toString(): string }>;
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

  const findByOpusIds = async (opusIds: string[]): Promise<Composition[]> => {
    await dbConnect();

    const validIds = opusIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (!validIds.length) {
      return [];
    }

    const docs = await CompositionModel.find({ opusId: { $in: validIds } })
      .sort({ order: 1, _id: 1 })
      .lean<DbComposition[]>();

    return docs.map(toEntity);
  };

  const findStandalonePaginated = async (
    filters: CompositionFilters,
    page: number,
    pageSize: number
  ): Promise<{ items: Composition[]; total: number }> => {
    await dbConnect();

    const query: any = { opusId: null };

    if (filters.search?.trim()) {
      const searchRegex = new RegExp(filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`), 'i');
      query.$or = [
        { 'title.uk': searchRegex },
        { 'title.en': searchRegex }
      ];
    }

    const [docs, total] = await Promise.all([
      CompositionModel.find(query)
        .sort({ createdAt: -1 })
        .skip(page * pageSize)
        .limit(pageSize)
        .lean<DbComposition[]>(),
      CompositionModel.countDocuments(query)
    ]);

    return { items: docs.map(toEntity), total };
  };

  return {
    findByOpusId,
    syncForOpus,
    deleteByOpusId,
    searchByTitle,
    findByOpusIds,
    findStandalonePaginated
  };
};

