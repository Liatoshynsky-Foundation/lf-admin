import mongoose, { FilterQuery, Model } from 'mongoose';

import { createBaseRepository } from '../baseRepository/baseRepository';
import { buildBaseQuery, combineConditions, fieldCondition } from '../helpers';
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

const COMPOSITION_SORT_FIELD_MAP: Record<string, string> = {
  number: 'name.uk',
};

const getCompositionSort = (filters?: CompositionFilters): Record<string, 1 | -1> => {
  if (filters?.sort?.length) {
    const { sortBy, sortOrder } = filters.sort[0];
    const field = COMPOSITION_SORT_FIELD_MAP[sortBy] ?? sortBy;
    return { [field]: sortOrder === 'asc' ? 1 : -1 };
  }
  return { createdAt: -1 };
};

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

const buildCompositionQuery = (
  filters?: CompositionFilters,
  extraConditions: FilterQuery<DbComposition>[] = []
) =>
  combineConditions([
    buildBaseQuery(
      { ...filters, statuses: undefined },
      ['genre', 'name.uk', 'name.en'],
      'name'
    ),
    fieldCondition(
      'status',
      filters?.statuses as OpusStatus[] | undefined,
      OpusStatus.Draft
    ),
    ...extraConditions,
  ]);

export const CompositionRepository = ({ CompositionModel }: CompositionRepoDeps): ICompositionRepository => {
  const baseRepo = createBaseRepository<Composition, DbComposition, CompositionFilters>({
    model: CompositionModel,
    toEntity,
    buildQuery: (filters) =>
      buildCompositionQuery(filters, [
        { 'name.uk': { $exists: true, $ne: null } }
      ]),
    getDefaultSort: getCompositionSort
  });

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

  const toValidObjectIds = (ids: string[]) =>
    ids.filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id));

  const countByIds = async (ids: string[], filters?: CompositionFilters): Promise<number> => {
    await dbConnect();

    const validIds = toValidObjectIds(ids);
    if (!validIds.length) {
      return 0;
    }

    const query = buildCompositionQuery(filters, [
      { _id: { $in: validIds } }
    ]);
    return CompositionModel.countDocuments(query);
  };

  const findByIdsPaginated = async (
    ids: string[],
    filters?: CompositionFilters
  ): Promise<{ items: Composition[]; total: number }> => {
    await dbConnect();

    const validIds = toValidObjectIds(ids);
    if (!validIds.length) {
      return { items: [], total: 0 };
    }

    const query = buildCompositionQuery(filters, [
      { _id: { $in: validIds } }
    ]);
    const total = await CompositionModel.countDocuments(query);

    const sort = getCompositionSort(filters);

    const queryBuilder = CompositionModel.find(query)
      .sort(sort)
      .collation({ locale: 'uk', numericOrdering: true });

    if (filters?.skip) queryBuilder.skip(filters.skip);
    if (filters?.limit) queryBuilder.limit(filters.limit);

    const docs = await queryBuilder.lean<DbComposition[]>();
    return { items: docs.map(toEntity), total };
  };

  return {
    ...baseRepo,
    syncForOpus,
    searchByTitle,
    findByIds,
    findByIdsPaginated,
    countByIds
  };
};
