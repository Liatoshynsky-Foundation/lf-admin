import mongoose, { Model } from 'mongoose';

import { createBaseRepository } from '../baseRepository/baseRepository';
import { buildBaseQuery, combineConditions, fieldCondition, getBaseSort } from '../helpers';
import { Composition } from '~/domain/entities/Composition';
import { CompositionFilters, CompositionInput, ICompositionRepository } from '~/domain/repositories/compositionRepository';
import dbConnect from '~/infrastructure/db/connect';
import { OpusStatus } from '~/types/graphql/generated/graphql';

export type DbComposition = {
  _id: { toString(): string };
  name: Composition['name'];
  year?: number | null;
  genre?: string | null;
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
  name: doc.name,
  year: doc.year ?? undefined,
  genre: doc.genre ?? undefined,
  audioAvailable: doc.audioAvailable ?? false,
  sheetAvailable: doc.sheetAvailable ?? false,
  sheetMusic: doc.sheetMusic ?? [],
  audios: doc.audios ?? [],
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt
});

export const CompositionRepository = ({ CompositionModel }: CompositionRepoDeps): ICompositionRepository => {
  const baseRepo = createBaseRepository<Composition, DbComposition, CompositionFilters>({
    model: CompositionModel,
    toEntity,
    buildQuery: (filters) => {
      const query = buildBaseQuery({ ...filters, statuses: undefined }, ['genre', 'name.uk', 'name.en']) ?? {};

      return combineConditions<DbComposition>([
        query,
        fieldCondition<DbComposition>('status', filters?.statuses as unknown as string[], OpusStatus.Draft as string),
        filters?.isStandalone === true ? { opusId: null } : null,
        filters?.isStandalone === false ? { opusId: { $ne: null } } : null
      ]);
    },
    getDefaultSort: getBaseSort
  });

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
      throw new Error(`Invalid opusId: ${opusId}`);
    }

    await CompositionModel.deleteMany({ opusId });
  };

  const syncForOpus = async (inputs: CompositionInput[]): Promise<Composition[]> => {
    await dbConnect();

    const results: Composition[] = [];

    for (let index = 0; index < inputs.length; index += 1) {
      const { id, ...fields } = inputs[index];

      if (id && mongoose.Types.ObjectId.isValid(id)) {
        const updated = await CompositionModel.findByIdAndUpdate(
          id,
          { ...fields, order: index },
          { new: true }
        ).lean<DbComposition>();

        if (updated) {
          results.push(toEntity(updated));
        }
      } else {
        const created = await new CompositionModel({ ...fields, order: index }).save();
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
      $or: [{ 'name.uk': { $regex: escaped, $options: 'i' } }, { 'name.en': { $regex: escaped, $options: 'i' } }]
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

  const findByIds = async (ids: string[]): Promise<Composition[]> => {
    await dbConnect();

    const validIds = ids
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (!validIds.length) {
      return [];
    }

    const docs = await CompositionModel.find({ _id: { $in: validIds } })
      .sort({ order: 1, _id: 1 })
      .lean<DbComposition[]>();

    return docs.map(toEntity);
  };

  return {
    ...baseRepo,
    findByOpusId,
    syncForOpus,
    deleteByOpusId,
    searchByTitle,
    findByOpusIds,
    findByIds
  };
};

