import mongoose, { FilterQuery, Model } from 'mongoose';

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

const COMPOSITION_SORT_FIELD_MAP: Record<string, string> = {
  number: 'name.uk',
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
    getDefaultSort: (filters) =>
      getBaseSort(filters, COMPOSITION_SORT_FIELD_MAP)
  });

  const toValidObjectIds = (ids: string[]) =>
    ids.filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id));


  const syncForOpus = async (inputs: CompositionInput[]): Promise<Composition[]> => {
    await dbConnect();
    const results = await Promise.all(
      inputs.map(async (input, index) => {
        const { id, ...fields } = input;
        if (id && mongoose.Types.ObjectId.isValid(id)) {
          const updated = await CompositionModel.findByIdAndUpdate(
            id, { ...fields, order: index }, { new: true }
          ).lean<DbComposition>();
          return updated ? toEntity(updated) : null;
        }
        const created = await new CompositionModel({ ...fields, order: index }).save();
        return toEntity(created.toObject() as unknown as DbComposition);
      })
    );
    return results.filter((r): r is Composition => r !== null);
  };

  const searchByTitle = async (search: string, ids?: string[]): Promise<Composition[]> => {
    await dbConnect();

    const trimmed = search.trim();

    let validIds: mongoose.Types.ObjectId[] = [];

    if (ids) {
      validIds = toValidObjectIds(ids);

      if (!validIds.length) {
        return [];
      }
    }

    const extraConditions: FilterQuery<DbComposition>[] = [];

    if (ids) {
      extraConditions.push({ _id: { $in: validIds } });
    }

    const query = buildCompositionQuery(
      trimmed ? ({ search: trimmed } as CompositionFilters) : undefined,
      extraConditions
    );

    const queryBuilder = CompositionModel.find(query)
      .collation({ locale: 'uk', numericOrdering: true })
      .lean<DbComposition[]>();

    if (trimmed) {
      queryBuilder.limit(10);
    }

    const docs = await queryBuilder;

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
  ): Promise<Composition[]> => {
    await dbConnect();

    const validIds = toValidObjectIds(ids);
    if (!validIds.length) {
      return [];
    }

    const query = buildCompositionQuery(filters, [
      { _id: { $in: validIds } }
    ]);

    const sort = getBaseSort(filters, COMPOSITION_SORT_FIELD_MAP);

    const queryBuilder = CompositionModel.find(query)
      .sort(sort)
      .collation({ locale: 'uk', numericOrdering: true });

    if (filters?.skip) queryBuilder.skip(filters.skip);
    if (filters?.limit) queryBuilder.limit(filters.limit);

    const docs = await queryBuilder.lean<DbComposition[]>();
    return docs.map(toEntity);
  };

  const findByName = async (name: string): Promise<Composition | null> => {
    await dbConnect();
    const doc = await CompositionModel.findOne({ 'name.uk': name.trim() })
      .collation({ locale: 'uk', strength: 2 })
      .lean<DbComposition>();
    return doc ? toEntity(doc) : null;
  };

  const create = async (input: CompositionInput): Promise<Composition> => {
    await dbConnect();
    
    const newComposition = await new CompositionModel(input).save();
    return toEntity(newComposition.toObject() as unknown as DbComposition);
  };

  return {
    ...baseRepo,
    syncForOpus,
    searchByTitle,
    findByIds,
    findByIdsPaginated,
    countByIds,
    findByName,
    create
  };
};
