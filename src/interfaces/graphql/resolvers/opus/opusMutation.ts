import { GraphQLError } from 'graphql';

import { markImagesAsUsed, processSlugUpdate, syncImagesCrops } from '../helpers';
import { opusServiceErrors } from '~/back-constants/errors';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { LocalizedBoolean, LocalizedImage, LocalizedString } from '~/domain/entities/BaseContent';
import type { Opus, OpusDescription, OpusNumberKind } from '~/domain/entities/Opus';
import { CompositionInput } from '~/domain/repositories/compositionRepository';
import { CreateOpusInput, UpdateOpusInput } from '~/domain/repositories/opusRepository';
import { generateUniqueSlug } from '~/src/shared/utils/slugGenerator/slugGenerator';
import { OpusStatus } from '~/types/enums/common.enums';

type GQLMediaFile = { name: string; fileUrl?: string | null; publishDate?: string | null };

type GQLComposition = {
  id?: string;
  title: string;
  genre?: string | null;
  year?: string | null;
  audios?: GQLMediaFile[];
  notes?: GQLMediaFile[];
};

export type CreateOpusGQLInput = {
  numberKind?: OpusNumberKind;
  number?: string;
  name?: string;
  additionalText?: string;
  creationYear?: string;
  endYear?: string;
  datesNote?: string;
  genre?: string;
  compositions?: GQLComposition[];
  adminTitle?: string;
  title: LocalizedString;
  description?: OpusDescription;
  keywords?: LocalizedString;
  allowIndexation?: LocalizedBoolean;
  coverImage?: LocalizedImage;
  status?: OpusStatus;
  publishedAt?: string;
};

export type UpdateOpusGQLInput = Partial<CreateOpusGQLInput>;

type CreateOpusArgs = { input: CreateOpusGQLInput };
type UpdateOpusArgs = { id: string; input: UpdateOpusGQLInput };

const assertAuthenticated = (context: GraphQLContext): void => {
  if (!context.admin) {
    throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
      extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
    });
  }
};

// numberKind + digits -> the canonical `number` lf-client reads, e.g. "op.50" / "wo.3".
const composeOpusNumber = (kind: OpusNumberKind | undefined, num: string | undefined): string => {
  const digits = (num ?? '').trim();
  const prefix = kind === 'woo' ? 'wo' : 'op';

  return digits ? `${prefix}.${digits}` : prefix;
};

const parseYear = (value: string | undefined): number | null => {
  const year = Number.parseInt((value ?? '').trim(), 10);

  return Number.isFinite(year) ? year : null;
};

const mapComposition = (composition: GQLComposition): CompositionInput => {
  const notesWithFiles = (composition.notes ?? []).filter((note) => note.fileUrl);
  const audios = (composition.audios ?? []).filter((audio) => audio.fileUrl || audio.name);

  return {
    id: composition.id,
    opusId: null,
    title: { uk: composition.title, en: composition.title },
    year: parseYear(composition.year ?? undefined),
    genre: composition.genre ?? null,
    genres: [],
    categories: [],
    audioAvailable: audios.length > 0,
    sheetAvailable: notesWithFiles.length > 0,
    sheetMusic: notesWithFiles.map((note) => ({
      url: note.fileUrl as string,
      name: note.name ?? null,
      publishDate: note.publishDate ?? null,
      isFree: true
    })),
    audios: audios.map((audio) => ({ name: audio.name ?? null, url: audio.fileUrl ?? null }))
  };
};

const buildOpusUpdateData = (
  input: UpdateOpusGQLInput,
  existingOpus: Opus,
  number: string | undefined
): UpdateOpusInput => {
  const candidate: UpdateOpusInput = {
    number,
    numberKind: number === undefined ? undefined : (input.numberKind ?? existingOpus.numberKind),
    title: input.title,
    name: input.name,
    additionalText: input.additionalText,
    creationYear: input.creationYear,
    releaseYear: input.creationYear === undefined ? undefined : parseYear(input.creationYear),
    endYear: input.endYear,
    datesNote: input.datesNote,
    genre: input.genre,
    adminTitle: input.adminTitle,
    description: input.description,
    keywords: input.keywords,
    allowIndexation: input.allowIndexation,
    coverImage: input.coverImage,
    status: input.status,
    publishedAt: input.publishedAt
  };

  return Object.fromEntries(Object.entries(candidate).filter(([, value]) => value !== undefined)) as UpdateOpusInput;
};

export const OpusMutation = {
  createOpus: async (_: unknown, { input }: CreateOpusArgs, context: GraphQLContext): Promise<Opus> => {
    assertAuthenticated(context);

    const repo = context.requestContainer.cradle.opusRepository;
    const compositionsRepo = context.requestContainer.cradle.compositionsRepository;

    const number = composeOpusNumber(input.numberKind, input.number);

    const existingByNumber = await repo.findByNumber(number);

    if (existingByNumber) {
      throw new GraphQLError(opusServiceErrors.NUMBER_ALREADY_EXISTS(number), {
        extensions: { code: 'DUPLICATE_OPUS_NUMBER' }
      });
    }

    const nameForSlug = input.name?.trim() || input.title?.uk;

    if (!nameForSlug) {
      throw new GraphQLError(opusServiceErrors.NAME_REQUIRED_FOR_SLUG, {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }

    const slug = await generateUniqueSlug(nameForSlug, {
      checkExists: async (candidate: string) => (await repo.findBySlug(candidate)) !== null
    });

    const opusData: CreateOpusInput = {
      number,
      numberKind: input.numberKind ?? 'op',
      title: input.title,
      releaseYear: parseYear(input.creationYear),
      name: input.name ?? null,
      additionalText: input.additionalText ?? null,
      creationYear: input.creationYear ?? null,
      endYear: input.endYear ?? null,
      datesNote: input.datesNote ?? null,
      genre: input.genre ?? null,
      adminTitle: input.adminTitle ?? null,
      slug,
      description: input.description ?? null,
      keywords: input.keywords ?? null,
      allowIndexation: input.allowIndexation ?? null,
      coverImage: input.coverImage ?? null,
      status: input.status || OpusStatus.Draft,
      publishedAt: input.publishedAt ?? null,
      meta: { views: 0 }
    };

    const opus = await repo.create(opusData);

    const compositions = await compositionsRepo.syncForOpus(
      opus.id,
      (input.compositions ?? []).map(mapComposition)
    );

    if (input.coverImage?.crop) {
      await syncImagesCrops(opus.id, input.coverImage, { isCoverImage: true });
    }

    if (input.coverImage) {
      const assetsRepo = context.requestContainer.cradle.assetsRepository;
      await markImagesAsUsed(assetsRepo, null, input.coverImage, 'opus', opus.id);
    }

    return { ...opus, compositions };
  },

  updateOpus: async (_: unknown, { id, input }: UpdateOpusArgs, context: GraphQLContext): Promise<Opus> => {
    assertAuthenticated(context);

    const repo = context.requestContainer.cradle.opusRepository;
    const compositionsRepo = context.requestContainer.cradle.compositionsRepository;

    const existingOpus = await repo.findById(id);

    if (!existingOpus) {
      throw new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(id), {
        extensions: { code: 'OPUS_NOT_FOUND' }
      });
    }

    const number =
      input.numberKind !== undefined || input.number !== undefined
        ? composeOpusNumber(input.numberKind ?? existingOpus.numberKind, input.number)
        : undefined;

    if (number && number !== existingOpus.number) {
      const duplicate = await repo.findByNumber(number);

      if (duplicate && duplicate.id !== id) {
        throw new GraphQLError(opusServiceErrors.NUMBER_ALREADY_EXISTS(number), {
          extensions: { code: 'DUPLICATE_OPUS_NUMBER' }
        });
      }
    }

    const updateData = buildOpusUpdateData(input, existingOpus, number);

    if (input.name) {
      await processSlugUpdate(id, input.name, repo, updateData);
    }

    const opus = await repo.update(id, updateData);

    if (!opus) {
      throw new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(id), {
        extensions: { code: 'OPUS_NOT_FOUND' }
      });
    }

    const compositions =
      input.compositions === undefined
        ? await compositionsRepo.findByOpusId(id)
        : await compositionsRepo.syncForOpus(id, input.compositions.map(mapComposition));

    if (input.coverImage?.crop) {
      await syncImagesCrops(opus.id, input.coverImage, { isCoverImage: true });
    }

    if (input.coverImage) {
      const assetsRepo = context.requestContainer.cradle.assetsRepository;
      await markImagesAsUsed(assetsRepo, null, input.coverImage, 'opus', opus.id);
    }

    return { ...opus, compositions };
  },

  deleteOpus: async (_: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
    assertAuthenticated(context);

    const repo = context.requestContainer.cradle.opusRepository;
    const compositionsRepo = context.requestContainer.cradle.compositionsRepository;

    await compositionsRepo.deleteByOpusId(id);

    return repo.delete(id);
  }
};
