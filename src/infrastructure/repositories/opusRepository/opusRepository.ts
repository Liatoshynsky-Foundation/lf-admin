import { Model } from 'mongoose';

import { createBaseRepository } from '../baseRepository/baseRepository';
import { opusServiceErrors } from '~/back-constants/errors';
import { LocalizedString } from '~/domain/entities/BaseContent';
import { Opus } from '~/domain/entities/Opus';
import { CreateOpusInput, IOpusRepository, OpusFilters } from '~/domain/repositories/opusRepository';
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
    keywords: doc.keywords ?? undefined,
    allowIndexation: doc.allowIndexation ?? undefined,
    coverImage: doc.coverImage ?? undefined,
    status: doc.status ?? undefined,
    meta: doc.meta ?? { views: 0 },
    publishedAt: doc.publishedAt ?? undefined,
    compositions: doc.compositions ?? undefined,
  });

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
    getDefaultSort: getBaseSort
  });

  const findByNumber = async (number: number): Promise<Opus | null> => {
    await dbConnect();

    if (number === undefined || number === null) {
      return null;
    }

    const doc = await OpusModel.findOne({ number }).lean<DbOpus>();
    return doc ? toEntity(doc) : null;
  };

  const getOrCreateCompositionsOpus = async (): Promise<{ _id: string }> => {
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
      { upsert: true, new: true }
    ).lean<{ _id: string }>();
  };

  const moveCompositionsToCompositionsOpus = async (
    compositionIds: string[],
  ): Promise<void> => {
    if (compositionIds.length === 0) {
      return;
    }
    const compOpus = await getOrCreateCompositionsOpus();
    await OpusModel.updateOne(
      { _id: compOpus._id },
      { $addToSet: { compositions: { $each: compositionIds } } },
    );
  };

  const removeCompositionsFromCompositionsOpus = async (
    compositionIds: string[],
  ): Promise<void> => {
    if (compositionIds.length === 0) {
      return;
    }
    const compOpus = await OpusModel.findOne({ numberKind: 'compositions' })
      .lean<{ _id: string }>();
    if (!compOpus) {
      return;
    }
    await OpusModel.updateOne(
      { _id: compOpus._id },
      { $pull: { compositions: { $in: compositionIds } } },
    );
  };

  const unlink = async (opusId: string): Promise<void> => {
    await dbConnect();
    const opus = await OpusModel.findById(opusId).lean<{ compositions?: string[] }>();
    await moveCompositionsToCompositionsOpus(opus?.compositions ?? []);
  };

  return {
    ...baseRepo,
    findByNumber,
    create: async (input: CreateOpusInput): Promise<Opus> => {
      await dbConnect();

      const existing = await findByNumber(input.number);

      if (existing) {
        throw new Error(opusServiceErrors.NUMBER_ALREADY_EXISTS(input.number));
      }

      const opusData = {
        ...input,
        meta: { views: input.meta?.views ?? 0 }
      };

      const newOpus = await new OpusModel(opusData).save();
      return toEntity(newOpus.toObject() as unknown as DbOpus);
    },
    unlink,
    moveCompositionsToCompositionsOpus,
    removeCompositionsFromCompositionsOpus
  };
};
