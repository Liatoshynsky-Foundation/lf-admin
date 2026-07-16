import { Model } from 'mongoose';

import { createBaseRepository } from '../baseRepository/baseRepository';
import { opusServiceErrors } from '~/back-constants/errors';
import { LocalizedString } from '~/domain/entities/BaseContent';
import { Opus } from '~/domain/entities/Opus';
import { CreateOpusInput, IOpusRepository, OpusFilters } from '~/domain/repositories/opusRepository';
import dbConnect from '~/infrastructure/db/connect';
import { buildBaseQuery, createToEntity, getBaseSort } from '~/infrastructure/repositories/helpers';
import { OpusNumberKind } from '~/types/graphql/generated/graphql';

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
  number: string;
  title: Opus['title'];
  releaseYear?: number | null;
  numberKind: Opus['numberKind'];
  name: Opus['name'];
  additionalText?: string | null;
  creationYear: string;
  endYear?: string | null;
  datesNote?: string | null;
  genre?: string | null;
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
};

type OpusRepoDeps = Readonly<{
  OpusModel: Model<DbOpus>;
}>;

const toEntity = (doc: DbOpus): Opus =>
  createToEntity<Opus, DbOpus>(doc, {
    number: doc.number,
    title: doc.title,
    releaseYear: doc.releaseYear ?? undefined,
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
    publishedAt: doc.publishedAt ?? undefined
  });

export const OpusRepository = ({ OpusModel }: OpusRepoDeps): IOpusRepository => {
  const baseRepo = createBaseRepository<Opus, DbOpus, OpusFilters>({
    model: OpusModel,
    toEntity,
    buildQuery: (filters) => {
      
      const query = buildBaseQuery(filters, [
        'genre',
        'name.uk',
        'name.en',
      ]) ?? {};

      if (filters?.numberKind) {
        const numberKindCondition =
      filters.numberKind === OpusNumberKind.Op
        ? {
          $or: [
            { numberKind: OpusNumberKind.Op },
            { numberKind: { $exists: false } },
            { numberKind: null }
          ]
        }
        : {
          numberKind: filters.numberKind
        };

        if (Object.keys(query).length === 0) {
          return numberKindCondition;
        }

        return {
          $and: [query, numberKindCondition]
        };
      }

      return query;
    },
    getDefaultSort: getBaseSort 
  });

  const findByNumber = async (number: string): Promise<Opus | null> => {
    await dbConnect();

    if (!number) {
      return null;
    }

    const doc = await OpusModel.findOne({ number }).lean<DbOpus>();
    return doc ? toEntity(doc) : null;
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
    }
  };
};
