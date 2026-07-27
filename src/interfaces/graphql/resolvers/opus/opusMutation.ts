import { GraphQLError } from 'graphql';

import { markImagesAsUsed, processSlugUpdate, syncImagesCrops } from '../helpers';
import { orderCompositionsByIds } from './tab-handlers/tabHandlersHelpers';
import { opusServiceErrors } from '~/back-constants/errors';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { LocalizedBoolean, LocalizedImage, LocalizedString } from '~/domain/entities/BaseContent';
import type {
  Opus,
  OpusDescription,
  OpusFull,
  OpusGalleryItem,
  OpusNumberKind,
  OpusPerformance
} from '~/domain/entities/Opus';
import { CompositionInput, ICompositionRepository } from '~/domain/repositories/compositionRepository';
import { CreateOpusInput, IOpusRepository, UpdateOpusInput } from '~/domain/repositories/opusRepository';
import { generateUniqueSlug } from '~/src/shared/utils/slugGenerator/slugGenerator';
import { OpusStatus, UpdateOpusStatusPayload } from '~/types/graphql/generated/graphql';

type GQLMediaFile = { name: string; fileUrl?: string | null; publishDate?: string | null };

type GQLComposition = {
  id?: string;
  name: string;
  genre?: string | null;
  year?: string | null;
  audios?: GQLMediaFile[];
  notes?: GQLMediaFile[];
};

export type CreateOpusGQLInput = {
  numberKind: OpusNumberKind;
  number: number;
  name: LocalizedString;
  additionalText?: string;
  creationYear: string;
  endYear?: string;
  datesNote?: string;
  genre?: LocalizedString;
  compositions?: GQLComposition[];
  adminTitle?: string;
  title: LocalizedString;
  description: OpusDescription;
  introDescription?: OpusDescription;
  parts?: OpusDescription;
  gallery?: OpusGalleryItem[];
  performancesTitle?: LocalizedString;
  performances?: OpusPerformance[];
  keywords?: LocalizedString;
  allowIndexation?: LocalizedBoolean;
  coverImage?: LocalizedImage;
  status?: OpusStatus;
  publishedAt?: string;
  blocksOrder?: string[] | null;
};

export type UpdateOpusGQLInput = Omit<CreateOpusGQLInput, 'title' | 'description'> & {
  title?: LocalizedString;
  description?: OpusDescription;
};

type CreateOpusArgs = { input: CreateOpusGQLInput };
type UpdateOpusArgs = { id: string; input: UpdateOpusGQLInput };

const assertAuthenticated = (context: GraphQLContext): void => {
  if (!context.admin) {
    throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
      extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
    });
  }
};

const parseYear = (value: string | undefined): number | null => {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;
  const year = Number.parseInt(trimmed, 10);
  return Number.isFinite(year) ? year : null;
};

const mapComposition = (composition: GQLComposition): CompositionInput => {
  const notesWithFiles = (composition.notes ?? []).filter((note) => note.fileUrl);
  const audios = (composition.audios ?? []).filter((audio) => audio.fileUrl || audio.name);

  return {
    id: composition.id,
    name: { uk: composition.name, en: composition.name },
    year: parseYear(composition.year ?? undefined),
    genre: composition.genre ?? null,
    audioAvailable: audios.length > 0,
    sheetAvailable: notesWithFiles.length > 0,
    sheetMusic: notesWithFiles.map((note) => ({
      url: note.fileUrl as string,
      name: note.name ?? null,
      publishDate: note.publishDate ?? null,
      isFree: true
    })),
    audios: audios.map((audio) => ({ name: audio.name ?? null, url: audio.fileUrl || null }))
  };
};

async function findExistingOpus(repo: IOpusRepository, id: string): Promise<Opus> {
  const existingOpus = await repo.findById(id);
  if (!existingOpus) {
    throw new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(id), {
      extensions: { code: 'OPUS_NOT_FOUND' }
    });
  }
  return existingOpus;
}

async function ensureUniqueOpusNumber(repo: IOpusRepository, id: string, number: number): Promise<void> {
  const duplicate = await repo.findByNumber(number);
  if (duplicate && duplicate.id !== id) {
    throw new GraphQLError(opusServiceErrors.NUMBER_ALREADY_EXISTS(number), {
      extensions: { code: 'DUPLICATE_OPUS_NUMBER' }
    });
  }
}

async function handleCompositionsSync(
  compositionsRepo: ICompositionRepository,
  repo: IOpusRepository,
  existingOpus: Opus,
  inputCompositions: GQLComposition[] | undefined
) {
  if (inputCompositions === undefined) {
    const compositionIds = existingOpus.compositions ?? [];
    return orderCompositionsByIds(compositionIds, await compositionsRepo.findByIds(compositionIds));
  }

  const compositions = await compositionsRepo.syncForOpus(inputCompositions.map(mapComposition));
  const oldCompositionIds = (existingOpus.compositions ?? []).map((cid) => cid.toString());
  const newCompositionIds = compositions.map((c) => c.id);

  const oldSet = new Set(oldCompositionIds);
  const newSet = new Set(newCompositionIds);
  const added = newCompositionIds.filter((cid) => !oldSet.has(cid));
  const removed = oldCompositionIds.filter((cid) => !newSet.has(cid));

  if (added.length > 0) {
    await repo.removeCompositionsFromCompositionsOpus(added);
  }
  if (removed.length > 0) {
    await repo.moveCompositionsToCompositionsOpus(removed);
  }

  return compositions;
}

async function updateAndVerifyOpus(repo: IOpusRepository, id: string, updateData: UpdateOpusInput): Promise<Opus> {
  const opus = await repo.update(id, updateData);
  if (!opus) {
    throw new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(id), {
      extensions: { code: 'OPUS_NOT_FOUND' }
    });
  }
  return opus;
}

const buildOpusUpdateData = (input: UpdateOpusGQLInput, compositionIds: string[]): UpdateOpusInput => {
  const candidate: UpdateOpusInput = {
    number: input.number,
    numberKind: input.numberKind,
    name: input.name,
    creationYear: input.creationYear,
    title: input.title,
    description: input.description,
    additionalText: input.additionalText,
    endYear: input.endYear,
    datesNote: input.datesNote,
    genre: input.genre,
    adminTitle: input.adminTitle,
    keywords: input.keywords,
    allowIndexation: input.allowIndexation,
    coverImage: input.coverImage,
    status: input.status,
    publishedAt: input.publishedAt,
    introDescription: input.introDescription,
    parts: input.parts,
    gallery: input.gallery,
    performancesTitle: input.performancesTitle,
    performances: input.performances,
    compositions: compositionIds,
    blocksOrder: input.blocksOrder
  };
  return Object.fromEntries(Object.entries(candidate).filter(([, value]) => value !== undefined)) as UpdateOpusInput;
};

export const OpusMutation = {
  createOpus: async (_: unknown, { input }: CreateOpusArgs, context: GraphQLContext): Promise<OpusFull> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.opusRepository;
    const compositionsRepo = context.requestContainer.cradle.compositionsRepository;

    const number = input.number;
    const existingByNumber = await repo.findByNumber(number);
    if (existingByNumber) {
      throw new GraphQLError(opusServiceErrors.NUMBER_ALREADY_EXISTS(number), {
        extensions: { code: 'DUPLICATE_OPUS_NUMBER' }
      });
    }

    const nameForSlug = input.name.uk?.trim();
    if (!nameForSlug) {
      throw new GraphQLError(opusServiceErrors.NAME_REQUIRED_FOR_SLUG, {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }
    const slug = await generateUniqueSlug(nameForSlug, {
      checkExists: async (candidate: string) => (await repo.findBySlug(candidate)) !== null
    });

    const compositions = await compositionsRepo.syncForOpus((input.compositions ?? []).map(mapComposition));
    const compositionIds = compositions.map((c) => c.id);

    const opusData: CreateOpusInput = {
      number: input.number,
      numberKind: input.numberKind,
      title: input.title,
      name: input.name,
      description: input.description,
      additionalText: input.additionalText ?? null,
      creationYear: input.creationYear,
      endYear: input.endYear ?? null,
      datesNote: input.datesNote ?? null,
      genre: input.genre ?? null,
      adminTitle: input.adminTitle ?? null,
      slug,
      introDescription: input.introDescription ?? null,
      parts: input.parts ?? null,
      keywords: input.keywords ?? null,
      allowIndexation: input.allowIndexation ?? null,
      coverImage: input.coverImage ?? null,
      status: input.status || OpusStatus.Draft,
      publishedAt: input.publishedAt ?? null,
      meta: { views: 0 },
      compositions: compositionIds,
      blocksOrder: input.blocksOrder ?? null
    };

    const opus = await repo.create(opusData);
    await repo.removeCompositionsFromCompositionsOpus(compositionIds);

    if (input.coverImage?.crop) {
      await syncImagesCrops(opus.id, input.coverImage, { isCoverImage: true });
    }
    if (input.coverImage) {
      const assetsRepo = context.requestContainer.cradle.assetsRepository;
      await markImagesAsUsed(assetsRepo, null, input.coverImage, 'opus', opus.id);
    }

    return { ...opus, compositions };
  },

  updateOpusStatus: async (
    _: unknown,
    { id, status }: { id: string; status: OpusStatus },
    context: GraphQLContext
  ): Promise<UpdateOpusStatusPayload> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.opusRepository;

    const existingOpus = await repo.findById(id);
    if (!existingOpus) {
      throw new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(id), {
        extensions: { code: 'OPUS_NOT_FOUND' }
      });
    }

    const updatedOpus = await repo.update(id, { status });
    if (!updatedOpus) {
      throw new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(id), {
        extensions: { code: 'OPUS_NOT_FOUND' }
      });
    }

    return { id: updatedOpus.id, status: updatedOpus.status as OpusStatus };
  },

  updateOpus: async (_: unknown, { id, input }: UpdateOpusArgs, context: GraphQLContext): Promise<OpusFull> => {
    assertAuthenticated(context);

    const {
      opusRepository: repo,
      compositionsRepository: compositionsRepo,
      assetsRepository: assetsRepo
    } = context.requestContainer.cradle;

    const existingOpus = await findExistingOpus(repo, id);

    await ensureUniqueOpusNumber(repo, id, input.number);

    const compositions = await handleCompositionsSync(compositionsRepo, repo, existingOpus, input.compositions);

    const updateData = buildOpusUpdateData(
      input,
      compositions.map((c) => c.id)
    );

    await processSlugUpdate(id, input.name, repo, updateData);

    const opus = await updateAndVerifyOpus(repo, id, updateData);

    if (input.coverImage?.crop) {
      await syncImagesCrops(opus.id, input.coverImage, { isCoverImage: true });
    }
    if (input.coverImage) {
      await markImagesAsUsed(assetsRepo, null, input.coverImage, 'opus', opus.id);
    }

    return { ...opus, compositions };
  },

  deleteOpus: async (_: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.opusRepository;
    await repo.unlink(id);
    return repo.delete(id);
  }
};
