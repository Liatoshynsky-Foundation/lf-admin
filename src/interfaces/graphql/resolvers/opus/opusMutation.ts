import { GraphQLError } from 'graphql';
import { ClientSession } from 'mongoose';

import {
  assertCompositionGenreValid,
  assertCompositionNameNotTaken,
  assertCompositionYearValid,
  compositionNameTakenError,
  throwIfCompositionNameDuplicateKey
} from '../compositions/compositionNameValidation';
import { resolveSheetMusicFileNames, syncCompositionMediaUsageRefs } from '../compositions/sheetMusicAssets';
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
import { withTransaction } from '~/src/infrastructure/repositories/helpers';
import { fileNameFromUrl } from '~/src/shared/utils/fileNameFromUrl';
import { generateUniqueSlug } from '~/src/shared/utils/slugGenerator/slugGenerator';
import { OpusGalleryItemInput, OpusStatus, UpdateOpusStatusPayload } from '~/types/graphql/generated/graphql';

type GQLMediaFile = {
  name?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  publishDate?: string | null;
};

type GQLAudioMediaFile = { name: string; fileUrl: string };

type GQLComposition = {
  id?: string;
  name: string;
  genre?: string | null;
  year?: string | null;
  audios?: GQLAudioMediaFile[];
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
  title?: LocalizedString;
  description?: OpusDescription;
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
type UnlinkCompositionArgs = { opusId: string; compositionId: string };

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

const formattedAdditionalText = (additionalText?: string | null): string | null | undefined => {
  if (additionalText === undefined) {
    return undefined;
  }

  return additionalText?.trim() || null;
};

async function assertCompositionsNamesNotTaken(
  compositionsRepo: ICompositionRepository,
  compositions: GQLComposition[]
): Promise<void> {
  const submittedNames = new Set<string>();

  for (const composition of compositions) {
    const name = composition.name?.trim();
    if (!name) {
      throw new GraphQLError(opusServiceErrors.COMPOSITION_NAME_REQUIRED, {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }

    const normalizedName = name.toLocaleLowerCase('uk');
    if (submittedNames.has(normalizedName)) {
      throw compositionNameTakenError(name);
    }
    submittedNames.add(normalizedName);

    await assertCompositionNameNotTaken(compositionsRepo, name, composition.id);
    assertCompositionGenreValid(composition.genre);
    assertCompositionYearValid(
      !composition.year?.trim() ? null : Number(composition.year)
    );
  }
}

const mapComposition = (composition: GQLComposition): CompositionInput => {
  const notes = (composition.notes ?? []).filter(
    (note) => note.name?.trim() || note.fileUrl || note.publishDate?.trim()
  );
  const audios = (composition.audios ?? []).filter((audio) => audio.fileUrl || audio.name);

  return {
    id: composition.id,
    name: { uk: composition.name.trim(), en: composition.name.trim() },
    year: parseYear(composition.year ?? undefined),
    genre: composition.genre || null,
    audioAvailable: audios.some((audio) => Boolean(audio.fileUrl?.trim())),
    sheetAvailable: notes.some((note) => Boolean(note.fileUrl?.trim())),
    sheetMusic: notes.map((note) => ({
      url: note.fileUrl?.trim() || null,
      name: note.name?.trim() || null,
      fileName: note.fileUrl ? fileNameFromUrl(note.fileUrl.trim()) : null,
      publishDate: note.publishDate ?? null,
      isFree: true
    })),
    audios: audios.map((audio) => ({ name: audio.name ?? null, url: audio.fileUrl || null }))
  };
};

const validateOpusName = (name?: LocalizedString): void => {
  const nameUk = name?.uk?.trim();
  const nameEn = name?.en?.trim();

  if (!nameUk || nameUk.length < 2 || nameUk.length > 250 || !nameEn || nameEn.length < 2 || nameEn.length > 250) {
    throw new GraphQLError(opusServiceErrors.NAME_LENGTH_INVALID, {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }
};

const validateCreationYear = (year?: string): void => {
  if (year === undefined) return;

  const yearStr = year.trim();
  if (!yearStr) {
    throw new GraphQLError(opusServiceErrors.CREATION_YEAR_REQUIRED, {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }

  const yearNum = Number(yearStr);
  if (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > 2100) {
    throw new GraphQLError(opusServiceErrors.CREATION_YEAR_INVALID, {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }
};

const validateOpusFields = (input: Partial<CreateOpusGQLInput> | UpdateOpusGQLInput): void => {
  if (input.number !== undefined && input.number < 0) {
    throw new GraphQLError(opusServiceErrors.NUMBER_NOT_NEGATIVE, {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }

  if (input.additionalText && input.additionalText.length > 40) {
    throw new GraphQLError(opusServiceErrors.ADDITIONAL_TEXT_TOO_LONG, {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }

  if (input.datesNote && input.datesNote.length > 40) {
    throw new GraphQLError(opusServiceErrors.DATES_NOTE_TOO_LONG, {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }

  const genreUk = input.genre?.uk?.trim();
  const genreEn = input.genre?.en?.trim();
  if ((genreUk && genreUk.length > 250) || (genreEn && genreEn.length > 250)) {
    throw new GraphQLError(opusServiceErrors.GENRE_TOO_LONG, {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }

  validateCreationYear(input.creationYear);
};

const validateGallery = (gallery?: OpusGalleryItemInput[] | null): void => {
  if (!gallery || gallery.length === 0) return;

  if (gallery.length > 20) {
    throw new GraphQLError(opusServiceErrors.GALLERY_TOO_MANY_PHOTOS, {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }

  for (const item of gallery) {
    const src = item.src?.trim();
    if (!src) continue;

    const altText = item.altText as { uk?: string; en?: string } | undefined;
    const altUk = altText?.uk?.trim();
    const altEn = altText?.en?.trim();

    if (!altUk || altUk.length < 2 || altUk.length > 250 || !altEn || altEn.length < 2 || altEn.length > 250) {
      throw new GraphQLError(opusServiceErrors.GALLERY_ALT_TEXT_REQUIRED, {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }

    const description = item.description as { uk?: string; en?: string } | undefined;
    const descUk = description?.uk?.trim();
    const descEn = description?.en?.trim();

    if (
      (descUk && (descUk.length < 2 || descUk.length > 250)) ||
      (descEn && (descEn.length < 2 || descEn.length > 250))
    ) {
      throw new GraphQLError(opusServiceErrors.GALLERY_DESCRIPTION_INVALID, {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }
  }
};

const validatePerformances = (performances?: OpusPerformance[] | null): void => {
  if (!performances || performances.length === 0) return;

  if (performances.length > 5) {
    throw new GraphQLError(opusServiceErrors.PERFORMANCES_TOO_MANY, {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }

  for (const perf of performances) {
    const videoUrl = perf.videoUrl?.trim();
    const title = perf.title as { uk?: string; en?: string } | undefined;
    const titleUk = title?.uk?.trim();
    const titleEn = title?.en?.trim();

    if (!videoUrl) {
      throw new GraphQLError(opusServiceErrors.PERFORMANCES_URL_REQUIRED, {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }

    if (
      !titleUk ||
      titleUk.length < 2 ||
      titleUk.length > 250 ||
      !titleEn ||
      titleEn.length < 2 ||
      titleEn.length > 250
    ) {
      throw new GraphQLError(opusServiceErrors.PERFORMANCES_TITLE_INVALID, {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }
  }
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

async function ensureUniqueOpus(repo: IOpusRepository, number: number, additionalText?: string | null, numberKind: string = 'op', excludeId?: string): Promise<void> {
  const duplicate = await repo.findByComplexKey(number, numberKind, additionalText);
  if (duplicate && duplicate.id !== excludeId) {
    throw new GraphQLError(opusServiceErrors.OPUS_ALREADY_EXISTS, {
      extensions: { code: 'DUPLICATE_OPUS_NUMBER' }
    });
  }
}

const isOpusAlreadyExistsError = (error: unknown): boolean =>
  error instanceof Error && error.message === opusServiceErrors.OPUS_ALREADY_EXISTS;

const duplicateOpusError = (): GraphQLError =>
  new GraphQLError(opusServiceErrors.OPUS_ALREADY_EXISTS, {
    extensions: { code: 'DUPLICATE_OPUS_NUMBER' }
  });

async function handleCompositionsSync(
  compositionsRepo: ICompositionRepository,
  repo: IOpusRepository,
  existingOpus: Opus,
  inputCompositions: GQLComposition[] | undefined,
  session?: ClientSession
) {
  if (inputCompositions === undefined) {
    const compositionIds = existingOpus.compositions ?? [];
    return orderCompositionsByIds(compositionIds, await compositionsRepo.findByIds(compositionIds, session));
  }

  let compositions;
  try {
    compositions = await compositionsRepo.syncForOpus(inputCompositions.map(mapComposition), session);
  } catch (error) {
    throwIfCompositionNameDuplicateKey(error, inputCompositions[0]?.name ?? '');
    throw error;
  }
  const oldCompositionIds = (existingOpus.compositions ?? []).map((cid) => cid.toString());
  const newCompositionIds = compositions.map((c) => c.id);

  const oldSet = new Set(oldCompositionIds);
  const newSet = new Set(newCompositionIds);
  const added = newCompositionIds.filter((cid) => !oldSet.has(cid));
  const removed = oldCompositionIds.filter((cid) => !newSet.has(cid));

  if (added.length > 0) {
    await repo.removeCompositionsFromCompositionsOpus(added, session);
  }
  if (removed.length > 0) {
    await repo.moveCompositionsToCompositionsOpus(removed, session);
  }

  return compositions;
}

async function updateAndVerifyOpus(
  repo: IOpusRepository,
  id: string,
  updateData: UpdateOpusInput,
  session?: ClientSession
): Promise<Opus> {
  let opus: Opus | null;
  try {
    opus = await repo.update(id, updateData, session);
  } catch (error) {
    if (isOpusAlreadyExistsError(error)) {
      throw duplicateOpusError();
    }
    throw error;
  }

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
    additionalText: formattedAdditionalText(input.additionalText),
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

    validateOpusFields(input);
    validateOpusName(input.name);
    validateGallery(input.gallery);
    validatePerformances(input.performances);

    const repo = context.requestContainer.cradle.opusRepository;
    const compositionsRepo = context.requestContainer.cradle.compositionsRepository;
    const assetsRepo = context.requestContainer.cradle.assetsRepository;
    await ensureUniqueOpus(
      repo,
      input.number,
      formattedAdditionalText(input.additionalText) ?? null,
      input.numberKind
    );
    const nameForSlug = input.name.uk?.trim();
    const slug = await generateUniqueSlug(nameForSlug, {
      checkExists: async (candidate) => (await repo.findBySlug(candidate)) !== null
    });

    await assertCompositionsNamesNotTaken(compositionsRepo, input.compositions ?? []);

    const { opus, compositions } = await withTransaction(async (session) => {
      let syncedCompositions;
      try {
        syncedCompositions = await compositionsRepo.syncForOpus(
          (input.compositions ?? []).map(mapComposition),
          session
        );
      } catch (error) {
        throwIfCompositionNameDuplicateKey(error, input.compositions?.[0]?.name ?? '');
        throw error;
      }
      const compositionIds = syncedCompositions.map((c) => c.id);

      const opusData: CreateOpusInput = {
        number: input.number,
        numberKind: input.numberKind,
        title: input.title,
        name: input.name,
        description: input.description,
        additionalText: formattedAdditionalText(input.additionalText) ?? null,
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
        gallery: input.gallery,
        performancesTitle: input.performancesTitle,
        performances: input.performances,
        blocksOrder: input.blocksOrder ?? null
      };

      let newOpus: Opus;
      try {
        newOpus = await repo.create(opusData, session);
      } catch (error) {
        if (isOpusAlreadyExistsError(error)) {
          throw duplicateOpusError();
        }
        throw error;
      }
      await repo.removeCompositionsFromCompositionsOpus(compositionIds, session);

      return { opus: newOpus, compositions: syncedCompositions };
    });

    if (input.coverImage?.crop) {
      await syncImagesCrops(opus.id, input.coverImage, { isCoverImage: true });
    }
    if (input.coverImage) {
      await markImagesAsUsed(assetsRepo, null, input.coverImage, 'opus', opus.id);
    }
    await resolveSheetMusicFileNames(
      (input.compositions ?? []).flatMap((composition) => composition.notes?.map((note) => note.fileUrl)),
      assetsRepo
    );
    await Promise.all(
      compositions.map((composition) => syncCompositionMediaUsageRefs(composition.id, null, composition, assetsRepo))
    );

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

    validateOpusFields(input);
    validateOpusName(input.name);

    if (input.gallery !== undefined) {
      validateGallery(input.gallery);
    }
    if (input.performances !== undefined) {
      validatePerformances(input.performances);
    }

    const {
      opusRepository: repo,
      compositionsRepository: compositionsRepo,
      assetsRepository: assetsRepo
    } = context.requestContainer.cradle;

    const existingOpus = await findExistingOpus(repo, id);

    const additionalText =
      input.additionalText === undefined ? existingOpus.additionalText ?? null : formattedAdditionalText(input.additionalText);

    await ensureUniqueOpus(repo, input.number, additionalText, input.numberKind, id);

    if (input.compositions !== undefined) {
      await assertCompositionsNamesNotTaken(compositionsRepo, input.compositions);
    }

    const previousCompositions = input.compositions === undefined
      ? []
      : await compositionsRepo.findByIds((existingOpus.compositions ?? []).map((compositionId) => compositionId.toString()));

    const { opus, compositions } = await withTransaction(async (session) => {
      const syncedCompositions = await handleCompositionsSync(
        compositionsRepo,
        repo,
        existingOpus,
        input.compositions,
        session
      );

      const updateData = buildOpusUpdateData(
        input,
        syncedCompositions.map((c) => c.id)
      );

      await processSlugUpdate(id, input.name, repo, updateData, session);

      const opus = await updateAndVerifyOpus(repo, id, updateData, session);


      return { opus, compositions: syncedCompositions };
    });

    if (input.coverImage?.crop) {
      await syncImagesCrops(opus.id, input.coverImage, { isCoverImage: true });
    }
    if (input.coverImage) {
      await markImagesAsUsed(assetsRepo, null, input.coverImage, 'opus', opus.id);
    }
    if (input.compositions !== undefined) {
      await resolveSheetMusicFileNames(
        input.compositions.flatMap((composition) => composition.notes?.map((note) => note.fileUrl)),
        assetsRepo
      );
      const previousCompositionById = new Map(previousCompositions.map((composition) => [composition.id, composition]));
      const updatedCompositionIds = new Set(compositions.map((composition) => composition.id));

      await Promise.all([
        ...compositions.map((composition) =>
          syncCompositionMediaUsageRefs(
            composition.id,
            previousCompositionById.get(composition.id),
            composition,
            assetsRepo
          )
        ),
        ...previousCompositions
          .filter((composition) => !updatedCompositionIds.has(composition.id))
          .map((composition) => syncCompositionMediaUsageRefs(composition.id, composition, null, assetsRepo))
      ]);
    }

    return { ...opus, compositions };
  },

  deleteOpus: async (_: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.opusRepository;
    return withTransaction(async (session) => {
      await repo.unlink(id, session);
      return repo.delete(id, session);
    });
  },

  unlinkComposition: async (_: unknown, { opusId, compositionId }: UnlinkCompositionArgs, context: GraphQLContext): Promise<OpusFull> => {
    assertAuthenticated(context);

    const {
      opusRepository: repo,
      compositionsRepository: compositionsRepo
    } = context.requestContainer.cradle;

    const existingOpus = await findExistingOpus(repo, opusId);

    const currentCompositions = (existingOpus.compositions ?? [])
      .filter((id): id is NonNullable<typeof id> => id != null)
      .map((id) => id.toString());
    
    if (!currentCompositions.includes(compositionId)) {
      throw new GraphQLError(opusServiceErrors.COMPOSITION_NOT_FOUND_IN_OPUS, {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }

    const updatedCompositionIds = currentCompositions.filter((id) => id !== compositionId);

    return withTransaction(async (session) => {
      const updatedOpus = await updateAndVerifyOpus(repo, opusId, {
        compositions: updatedCompositionIds
      }, session);

      await repo.moveCompositionsToCompositionsOpus([compositionId], session);

      const compositions = await compositionsRepo.findByIds(updatedCompositionIds, session);
      const orderedCompositions = orderCompositionsByIds(updatedCompositionIds, compositions);

      return { ...updatedOpus, compositions: orderedCompositions };
    });
  },
};
