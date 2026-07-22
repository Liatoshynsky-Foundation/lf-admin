import { GraphQLError } from 'graphql';

import { markImagesAsUsed, processSlugUpdate, syncImagesCrops } from '../helpers';
import { orderCompositionsByIds } from './tab-handlers/tabHandlersHelpers';
import { opusServiceErrors } from '~/back-constants/errors';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import { LocalizedBoolean, LocalizedImage, LocalizedString } from '~/domain/entities/BaseContent';
import type { Opus, OpusDescription, OpusFull, OpusGalleryItem, OpusNumberKind, OpusPerformance } from '~/domain/entities/Opus';
import { CompositionInput } from '~/domain/repositories/compositionRepository';
import { CreateOpusInput, UpdateOpusInput } from '~/domain/repositories/opusRepository';
import { Composition } from '~/src/domain/entities/Composition';
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
  name?: LocalizedString;
  additionalText?: string;
  creationYear?: string;
  endYear?: string;
  datesNote?: string;
  genre?: string;
  compositions?: GQLComposition[];
  adminTitle?: string;
  title: LocalizedString;
  description?: OpusDescription;

  introDescription?: OpusDescription; 
  parts?: OpusDescription;
  gallery?: OpusGalleryItem[];
  performancesTitle?: LocalizedString;
  performances?: OpusPerformance[]

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

const parseYear = (value: string | undefined): number | null => {
  const year = Number.parseInt((value ?? '').trim(), 10);

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
    audios: audios.map((audio) => ({ name: audio.name ?? null, url: audio.fileUrl ?? null }))
  };
};

const buildOpusUpdateData = (
  input: UpdateOpusGQLInput,
  existingOpus: Opus,
  number: number | undefined
): UpdateOpusInput => {
  const candidate: UpdateOpusInput = {
    number: Number(number),
    numberKind: input.numberKind ?? existingOpus.numberKind,
    title: input.title,
    name: input.name,
    additionalText: input.additionalText,
    creationYear: input.creationYear,
    endYear: input.endYear,
    datesNote: input.datesNote,
    genre: input.genre,
    adminTitle: input.adminTitle,
    description: input.description,
    keywords: input.keywords,
    allowIndexation: input.allowIndexation,
    coverImage: input.coverImage,
    status: input.status,
    publishedAt: input.publishedAt,
    introDescription: input.introDescription,
    parts: input.parts,
    gallery: input.gallery,
    performancesTitle: input.performancesTitle,
    performances: input.performances
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

    const nameForSlug = input.name?.uk?.trim() || input.title?.uk;
    if (!nameForSlug) {
      throw new GraphQLError(opusServiceErrors.NAME_REQUIRED_FOR_SLUG, {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }
    const slug = await generateUniqueSlug(nameForSlug, {
      checkExists: async (candidate: string) => (await repo.findBySlug(candidate)) !== null
    });

    const compositions = await compositionsRepo.syncForOpus(
      (input.compositions ?? []).map(mapComposition)
    );
    const compositionIds = compositions.map((c) => c.id);

    const opusData: CreateOpusInput = {
      number: Number(input.number),
      numberKind: input.numberKind ?? 'op',
      title: input.title,
      name: input.name,
      additionalText: input.additionalText ?? null,
      creationYear: input.creationYear ?? null,
      endYear: input.endYear ?? null,
      datesNote: input.datesNote ?? null,
      genre: input.genre ?? null,
      adminTitle: input.adminTitle ?? null,
      slug,
      description: input.description ?? null,
      introDescription: input.introDescription ?? null,
      parts: input.parts ?? null,
      keywords: input.keywords ?? null,
      allowIndexation: input.allowIndexation ?? null,
      coverImage: input.coverImage ?? null,
      status: input.status || OpusStatus.Draft,
      publishedAt: input.publishedAt ?? null,
      meta: { views: 0 },
      compositions: compositionIds
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

  updateOpusStatus: async (_: unknown, { id, status }: { id: string; status: OpusStatus }, context: GraphQLContext): Promise<UpdateOpusStatusPayload> => {
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

    const repo = context.requestContainer.cradle.opusRepository;
    const compositionsRepo = context.requestContainer.cradle.compositionsRepository;
    
    const existingOpus = await repo.findById(id);

    if (!existingOpus) {
      throw new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(id), {
        extensions: { code: 'OPUS_NOT_FOUND' }
      });
    }

    const number = input.number;

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

    let compositions: Composition[];

    if (input.compositions === undefined) {
      const compositionIds = existingOpus.compositions ?? [];
      compositions = orderCompositionsByIds(compositionIds, await compositionsRepo.findByIds(compositionIds));
    } else {
      compositions = await compositionsRepo.syncForOpus(input.compositions.map(mapComposition));
      updateData.compositions = compositions.map((c) => c.id);

      const oldCompositionIds = (existingOpus.compositions ?? []).map((cid) => cid.toString());
      const newCompositionIds = compositions.map((c) => c.id);

      const added = newCompositionIds.filter((cid) => !oldCompositionIds.includes(cid));
      const removed = oldCompositionIds.filter((cid) => !newCompositionIds.includes(cid));

      if (added.length > 0) {
        await repo.removeCompositionsFromCompositionsOpus(added);
      }
      if (removed.length > 0) {
        await repo.moveCompositionsToCompositionsOpus(removed);
      }
    }

    const opus = await repo.update(id, updateData);

    if (!opus) {
      throw new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(id), {
        extensions: { code: 'OPUS_NOT_FOUND' }
      });
    }

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
    await repo.unlink(id);

    return repo.delete(id);
  }
};
