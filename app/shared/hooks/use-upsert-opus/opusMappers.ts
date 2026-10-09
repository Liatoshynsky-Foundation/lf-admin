import {
  SeoBlockValue
} from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { fileNameFromUrl } from '~/src/shared/utils/assets/assetFilename';
import { CropRect } from '~/types/common';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  OpusNumberKind,
  OpusStatus,
  UpdateOpusMutationVariables
} from '~/types/graphql/generated/graphql';
import {
  OpusCompositionData,
  OpusCompositionInput,
  OpusDetailsValue
} from '~/types/opus';

export const toOpusNumberKind = (value: string): OpusNumberKind => {
  if (value === OpusNumberKind.Sineop || value === OpusNumberKind.Compositions) {
    return value;
  }

  return OpusNumberKind.Op;
};

const toOpusStatus = (status: BaseContentStatuses): OpusStatus => {
  if (status === BaseContentStatuses.Published) {
    return OpusStatus.Published;
  }

  return OpusStatus.Draft;
};

const getOpusNumber = (value: string, fallback = 0): number => {
  const number = Number(value.trim());

  return Number.isFinite(number) ? number : fallback;
};

const getAltText = (altText: string | undefined, hasOgImage: boolean, fallback: string): string => {
  const trimmedAlt = altText?.trim();

  return hasOgImage ? (trimmedAlt ?? '') : trimmedAlt || fallback;
};

export const toCompositionInput = (composition: OpusCompositionData): OpusCompositionInput => ({
  id: composition.id,
  name: composition.name.trim(),
  genre: composition.genre.trim() || undefined,
  year: composition.year.trim() || undefined,

  audios: composition.audios
    .filter((audio) => audio.name?.trim() || audio.fileUrl)
    .map((audio) => ({
      name: audio.name?.trim() || fileNameFromUrl(audio.fileUrl),
      fileUrl: audio.fileUrl
    })),

  notes: composition.notes
    .filter((note) => note.name?.trim() || note.fileUrl || note.publishDate?.trim())
    .map((note) => ({
      name: note.name?.trim() || '',
      fileUrl: note.fileUrl,
      publishDate: note.publishDate
    }))
});

type BuildOpusInputArgs = {
  details: OpusDetailsValue;
  seoValue: SeoBlockValue;
  crop: CropRect | null;
  isEditing: boolean;
  status?: BaseContentStatuses;
};

const buildDetailsInput = (
  details: OpusDetailsValue,
  isEditing: boolean
): Pick<
  UpdateOpusMutationVariables['input'],
  | 'numberKind'
  | 'number'
  | 'name'
  | 'additionalText'
  | 'creationYear'
  | 'endYear'
  | 'datesNote'
  | 'genre'
  | 'compositions'
  | 'adminTitle'
> => {
  const opusName = details.name.trim();

  return {
    numberKind: toOpusNumberKind(details.numberKind),
    number: getOpusNumber(details.number),
    name: {
      uk: opusName,
      en: isEditing ? undefined : opusName
    },
    additionalText: details.additionalText.trim() || undefined,
    creationYear: details.creationYear.trim(),
    endYear: details.endYear.trim() || undefined,
    datesNote: details.datesNote.trim() || undefined,
    genre: {
      uk: details.genre.trim() || undefined,
      en: isEditing ? undefined : details.genre.trim() || undefined
    },
    compositions: details.compositions.map(toCompositionInput),
    adminTitle: opusName
  };
};

const buildSeoInput = (
  details: OpusDetailsValue,
  seoValue: SeoBlockValue,
  crop: CropRect | null
): Pick<
  UpdateOpusMutationVariables['input'],
  'title' | 'description' | 'keywords' | 'allowIndexation' | 'coverImage'
> => {
  const { uk: ukMeta, en: enMeta } = seoValue.meta;
  const opusName = details.name.trim();
  const hasOgImage = Boolean(seoValue.ogImage);

  return {
    title: { uk: ukMeta.title.trim(), en: enMeta.title.trim() },
    description: { uk: ukMeta.description.trim(), en: enMeta.description.trim() },
    keywords: { uk: ukMeta.keywords.trim(), en: enMeta.keywords.trim() },
    allowIndexation: { uk: seoValue.allowIndexing.uk, en: seoValue.allowIndexing.en },
    coverImage: {
      src: seoValue.ogImage || opusName,
      alt: {
        uk: getAltText(ukMeta.altText?.uk, hasOgImage, opusName),
        en: getAltText(enMeta.altText?.en, hasOgImage, opusName)
      },
      caption: { uk: opusName, en: opusName },
      ...(crop && { crop })
    }
  };
};

const buildStatusInput = (
  status?: BaseContentStatuses
): Pick<UpdateOpusMutationVariables['input'], 'status' | 'publishedAt'> => {
  if (!status) return {};

  return {
    status: toOpusStatus(status),
    publishedAt: status === BaseContentStatuses.Published ? new Date().toISOString() : undefined
  };
};

export const buildOpusInput = ({
  details,
  seoValue,
  crop,
  isEditing,
  status
}: BuildOpusInputArgs): UpdateOpusMutationVariables['input'] => ({
  ...buildDetailsInput(details, isEditing),
  ...buildSeoInput(details, seoValue, crop),
  ...buildStatusInput(status)
});
