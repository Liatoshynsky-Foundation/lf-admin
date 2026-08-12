import { ClientSession, Model } from 'mongoose';

import { createBaseRepository } from '../baseRepository/baseRepository';
import { opusServiceErrors } from '~/back-constants/errors';
import { LocalizedString } from '~/domain/entities/BaseContent';
import { Opus } from '~/domain/entities/Opus';
import { CreateOpusInput, IOpusRepository, OpusFilters, UpdateOpusInput } from '~/domain/repositories/opusRepository';
import dbConnect from '~/infrastructure/db/connect';
import { buildBaseQuery, combineConditions, createToEntity, fieldCondition, getBaseSort } from '~/infrastructure/repositories/helpers';
import { OpusNumberKind, OpusStatus } from '~/types/graphql/generated/graphql';

export type DbOpusGalleryItem = {
  _id?: { toString(): string };
  src: string;
  description?: LocalizedString | null;
  altText?: LocalizedString | null;
  crop?: { x?: number; y?: number; width?: number; height?: number } | null;
};

export type DbOpusPerformance = {
  _id?: { toString(): string };
  title?: LocalizedString | null;
  videoUrl?: string | null;
};

export type DbOpus = {
  _id: { toString(): string };
  number: number;
  name: Opus['name'];
  numberKind: Opus['numberKind'];
  title: Opus['title'];
  additionalText?: string | null;
  creationYear: string;
  endYear?: string | null;
  datesNote?: string | null;
  genre?: LocalizedString | null;
  adminTitle?: string | null;
  slug?: string | null;
  description: Opus['description'];
  introDescription: Opus['introDescription'];
  parts: Opus['parts'];
  gallery?: DbOpusGalleryItem[];
  performancesTitle: Opus['performancesTitle'];
  performances?: DbOpusPerformance[];
  blocksOrder?: string[] | null;
  keywords: Opus['keywords'];
  allowIndexation: Opus['allowIndexation'];
  coverImage: Opus['coverImage'];
  status: Opus['status'];
  meta: Opus['meta'];
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  compositions: string[];
};

type OpusRepoDeps = Readonly<{
  OpusModel: Model<DbOpus>;
}>;

const toEntity = (doc: DbOpus): Opus =>
  createToEntity<Opus, DbOpus>(doc, {
    number: doc.number,
    title: doc.title,
    numberKind: doc.numberKind ?? 'op',
    name: typeof doc.name === 'string' ? { uk: doc.name, en: doc.name } : (doc.name ?? { uk: '', en: '' }),
    additionalText: doc.additionalText ?? undefined,
    creationYear: doc.creationYear ?? '',
    endYear: doc.endYear ?? undefined,
    datesNote: doc.datesNote ?? undefined,
    genre: doc.genre ?? undefined,
    adminTitle: doc.adminTitle ?? undefined,
    slug: doc.slug ?? undefined,
    description: doc.description ?? undefined,
    introDescription: doc.introDescription ?? undefined,
    parts: doc.parts ?? undefined,
    performancesTitle: doc.performancesTitle ?? undefined,
    gallery:
      doc.gallery?.map((item) => ({
        id: item._id?.toString() ?? '',
        src: item.src,
        description: item.description,
        altText: item.altText,
        crop:
          item.crop?.x !== undefined && item.crop?.y !== undefined
            ? {
              x: Number(item.crop.x) || 0,
              y: Number(item.crop.y) || 0,
              width: Number(item.crop.width) || 0,
              height: Number(item.crop.height) || 0
            }
            : null
      })) ?? [],
    performances:
      doc.performances?.map((perf) => ({
        id: perf._id?.toString() ?? '',
        title: perf.title,
        videoUrl: perf.videoUrl
      })) ?? [],
    blocksOrder: doc.blocksOrder ?? undefined,
    keywords: doc.keywords ?? undefined,
    allowIndexation: doc.allowIndexation ?? undefined,
    coverImage: doc.coverImage ?? undefined,
    status: doc.status ?? undefined,
    meta: doc.meta ?? { views: 0 },
    publishedAt: doc.publishedAt ?? undefined,
    compositions: doc.compositions ?? undefined,
  });

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;

const getSort = (filters?: OpusFilters): Record<string, 1 | -1> => {
  if (filters?.sort?.length) {
    const { sortBy, sortOrder } = filters.sort[0];
    const direction = sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'number') {
      return { number: direction, additionalText: direction };
    }

    return getBaseSort(filters);
  }

  return { number: 1, additionalText: 1 };
};

const getDefaultSort = (): Record<string, 1 | -1> => ({ number: 1, additionalText: 1 });

export const OpusRepository = ({ OpusModel }: OpusRepoDeps): IOpusRepository => {
  const baseRepo = createBaseRepository<Opus, DbOpus, OpusFilters>({
    model: OpusModel,
    toEntity,
    buildQuery: (filters) => {
      const query = buildBaseQuery({ ...filters, statuses: undefined }, ['genre.uk', 'genre.en', 'name.uk', 'name.en'], 'name') ?? {};

      return combineConditions<DbOpus>([
        query,
        fieldCondition<DbOpus>('status', filters?.statuses as unknown as string[], OpusStatus.Draft as string),
        fieldCondition<DbOpus>('numberKind', filters?.numberKind as unknown as string, OpusNumberKind.Op as string),
        { number: { $type: 'number' } }
      ]);
    },
    getSort,
    getDefaultSort
  });

  const findByComplexKey = async (
    number: number,
    numberKind: string,
    additionalText?: string | null,
    session?: ClientSession
  ): Promise<Opus | null> => {
    await dbConnect();
    if (number === undefined || number === null) return null;

    const trimmed = additionalText?.trim();

    const doc = await OpusModel.findOne({
      number,
      numberKind,
      additionalText: trimmed
        ? { $regex: `^${escapeRegExp(trimmed)}$`, $options: 'i' }
        : null
    })
      .session(session ?? null)
      .lean<DbOpus>();

    return doc ? toEntity(doc) : null;
  };

  const getOrCreateCompositionsOpus = async (
    session?: ClientSession 
  ): Promise<{ _id: string }> => {
    return OpusModel.findOneAndUpdate(
      { numberKind: 'compositions' },
      {
        $setOnInsert: {
          numberKind: 'compositions',
          number: 0,
          name: { uk: 'Без номера', en: 'Without number' },
          title: { uk: 'Без номера', en: 'Without number' },
          adminTitle: 'Без номера',
          compositions: []
        }
      },
      { 
        upsert: true,
        new: true,
        session: session
      }
    ).lean<{ _id: string }>();
  };

  const moveCompositionsToCompositionsOpus = async (
    compositionIds: string[],
    session?: ClientSession
  ): Promise<void> => {
    if (compositionIds.length === 0) {
      return;
    }

    const compOpus = await getOrCreateCompositionsOpus(session);

    await OpusModel.updateOne(
      { _id: compOpus._id },
      { $addToSet: { compositions: { $each: compositionIds } } },
      { session }
    );
  };

  const removeCompositionsFromCompositionsOpus = async (
    compositionIds: string[],
    session?: ClientSession
  ): Promise<void> => {
    if (compositionIds.length === 0) {
      return;
    }

    const compOpus = await OpusModel.findOne({ numberKind: 'compositions' })
      .session(session ?? null)
      .lean<{ _id: string }>();

    if (!compOpus) {
      return;
    }

    await OpusModel.updateOne(
      { _id: compOpus._id },
      { $pull: { compositions: { $in: compositionIds } } },
      { session } 
    );
  };

  const unlink = async (opusId: string, session?: ClientSession): Promise<void> => {
    await dbConnect();
    const opus = await OpusModel.findById(opusId)
      .session(session ?? null)
      .lean<{ compositions?: string[] }>();

    await moveCompositionsToCompositionsOpus(opus?.compositions ?? [], session);
  };

  return {
    ...baseRepo,
    findByComplexKey,
    create: async (input: CreateOpusInput, session?: ClientSession): Promise<Opus> => {
      await dbConnect();

      const existing = await findByComplexKey(input.number, input.numberKind, input.additionalText, session);
      if (existing) {
        throw new Error(opusServiceErrors.OPUS_ALREADY_EXISTS);
      }

      const opusData = {
        ...input,
        meta: { views: input.meta?.views ?? 0 }
      };

      try {
        const [newOpus] = await OpusModel.create([opusData], { session });
        return toEntity(newOpus.toObject() as unknown as DbOpus);
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          throw new Error(opusServiceErrors.OPUS_ALREADY_EXISTS);
        }
        throw error;
      }
    },
    update: async (id: string, input: UpdateOpusInput, session?: ClientSession): Promise<Opus | null> => {
      try {
        return await baseRepo.update(id, input, session);
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          throw new Error(opusServiceErrors.OPUS_ALREADY_EXISTS);
        }
        throw error;
      }

    },
    unlink,
    moveCompositionsToCompositionsOpus,
    removeCompositionsFromCompositionsOpus
  };
};
