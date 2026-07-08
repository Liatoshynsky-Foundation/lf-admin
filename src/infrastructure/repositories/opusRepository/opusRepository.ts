import { Model } from 'mongoose';

import { createBaseRepository } from '../baseRepository/baseRepository';
import { opusServiceErrors } from '~/back-constants/errors';
import { Opus } from '~/domain/entities/Opus';
import { CreateOpusInput, IOpusRepository, OpusFilters } from '~/domain/repositories/opusRepository';
import dbConnect from '~/infrastructure/db/connect';
import { buildBaseQuery, createToEntity, getBaseSort } from '~/infrastructure/repositories/helpers';
import { OpusNumberKind } from '~/types/graphql/generated/graphql';

export type DbOpus = {
  _id: { toString(): string };
  number: string;
  title: Opus['title'];
  releaseYear?: number | null;
  numberKind: Opus['numberKind'];
  name?: string | null;
  additionalText?: string | null;
  creationYear: string;
  endYear?: string | null;
  datesNote?: string | null;
  genre?: string | null;
  adminTitle?: string | null;
  slug?: string | null;
  description: Opus['description'];
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
    numberKind: doc.numberKind ?? OpusNumberKind.Op,
    name: doc.name ?? undefined,
    additionalText: doc.additionalText ?? undefined,
    creationYear: doc.creationYear ?? '',
    endYear: doc.endYear ?? undefined,
    datesNote: doc.datesNote ?? undefined,
    genre: doc.genre ?? undefined,
    adminTitle: doc.adminTitle ?? undefined,
    slug: doc.slug ?? undefined,
    description: doc.description ?? undefined,
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
    buildQuery: (filters) => buildBaseQuery(filters),
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
