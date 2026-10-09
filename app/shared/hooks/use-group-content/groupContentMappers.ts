import { toOpusNumberKind } from '../use-upsert-opus/opusMappers';
import { isMediaItemFilled } from './compositionMedia';
import { GroupData, GroupPhoto } from '~/constants/creativity';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  OpusStatus,
  UpdateOpusMutationVariables
} from '~/types/graphql/generated/graphql';

const DEFAULT_BLOCKS_ORDER = ['details', 'intro', 'photos', 'works', 'performances'];

const mapStatus = (statusToSave?: BaseContentStatuses): OpusStatus | undefined => {
  if (statusToSave === BaseContentStatuses.Published) {
    return OpusStatus.Published;
  }

  return undefined;
};

const getPersistedId = (id?: string): string | undefined => {
  if (!id || id.includes('-')) {
    return undefined;
  }

  return id;
};

type LocalizedText = { uk?: string | null; en?: string | null };

const trimText = (value?: string | null): string => value?.trim() || '';

const mapLocalizedTrimmedValue = (value?: LocalizedText | null) => ({
  uk: trimText(value?.uk),
  en: trimText(value?.en)
});

const mapCompositionInput = (
  work: NonNullable<GroupData['compositions']>[number],
  index: number
): NonNullable<UpdateOpusMutationVariables['input']['compositions']>[number] => ({
  id: work.id,
  name: work.name.trim(),
  genre: work.genre.trim() || undefined,
  year: work.year.trim() || undefined,
  order: index + 1,
  audios: (work.audios || [])
    .filter(isMediaItemFilled)
    .map((audio) => ({
      name: audio.name,
      fileUrl: audio.fileUrl,
      publishDate: ''
    })),
  notes: (work.notes || [])
    .filter(isMediaItemFilled)
    .map((note) => ({
      name: note.name?.trim() || '',
      fileName: note.fileName,
      fileUrl: note.fileUrl ? note.fileUrl : null,
      publishDate: note.publishDate || ''
    }))
});

const mapCrop = (photo: GroupPhoto): NonNullable<
  NonNullable<UpdateOpusMutationVariables['input']['gallery']>[number]['crop']
> | null => {
  const cropData = photo.crop as {
    rect?: { x: number; y: number; width: number; height: number };
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  } | null;

  if (!cropData) return null;

  return {
    x: cropData.rect?.x ?? cropData.x ?? 0,
    y: cropData.rect?.y ?? cropData.y ?? 0,
    width: cropData.rect?.width ?? cropData.width ?? 0,
    height: cropData.rect?.height ?? cropData.height ?? 0
  };
};

const mapGalleryInput = (
  photo: GroupPhoto
): NonNullable<UpdateOpusMutationVariables['input']['gallery']>[number] => ({
  id: getPersistedId(photo.id),
  src: photo.src ? String(photo.src) : '',
  description: mapLocalizedTrimmedValue(photo.caption),
  altText: mapLocalizedTrimmedValue(photo.altText),
  crop: mapCrop(photo)
});

const mapPerformanceInput = (
  perf: NonNullable<GroupData['performances']>[number]
): NonNullable<UpdateOpusMutationVariables['input']['performances']>[number] => ({
  id: getPersistedId(perf.id),
  title: mapLocalizedTrimmedValue(perf.caption),
  videoUrl: (perf.url || '').trim()
});

const buildGroupDetailsInput = (
  groupData: GroupData,
  mappedStatus?: OpusStatus
): Pick<
  UpdateOpusMutationVariables['input'],
  | 'number'
  | 'numberKind'
  | 'genre'
  | 'additionalText'
  | 'status'
  | 'name'
  | 'creationYear'
  | 'endYear'
  | 'datesNote'
> => ({
  number: Number(groupData.groupNumber.trim()),
  numberKind: toOpusNumberKind(groupData.titlePrefix),
  genre: mapLocalizedTrimmedValue(groupData.genre),
  additionalText: String(groupData.additionalText || '').trim() || '',
  ...(mappedStatus && { status: mappedStatus }),
  name: {
    uk: String(groupData.groupTitle?.uk || ''),
    en: String(groupData.groupTitle?.en || '')
  },
  creationYear: String(groupData.creationYear || '').trim(),
  endYear: groupData.endYear ? String(groupData.endYear) : null,
  datesNote: groupData.dateAdditionalText ? String(groupData.dateAdditionalText).trim() : null
});

const buildGroupRichContentInput = (
  groupData: GroupData
): Pick<UpdateOpusMutationVariables['input'], 'parts' | 'introDescription' | 'blocksOrder'> => ({
  parts: {
    uk: String(groupData.parts?.uk || ''),
    en: String(groupData.parts?.en || '')
  },
  introDescription: {
    uk: groupData.description?.uk ? JSON.stringify(groupData.description.uk) : '""',
    en: groupData.description?.en ? JSON.stringify(groupData.description.en) : '""'
  },
  blocksOrder: groupData.blocksOrder || DEFAULT_BLOCKS_ORDER
});

const buildGroupMediaInput = (
  groupData: GroupData
): Pick<
  UpdateOpusMutationVariables['input'],
  'compositions' | 'gallery' | 'performancesTitle' | 'performances'
> => ({
  compositions: (groupData.compositions || []).map((composition, index) =>
    mapCompositionInput(composition, index)
  ),
  gallery: (groupData.photos || []).map(mapGalleryInput),
  performancesTitle: {
    uk: String(groupData.performancesTitle || ''),
    en: String(groupData.performancesTitle || '')
  },
  performances: (groupData.performances || [])
    .map(mapPerformanceInput)
    .filter((perf) => perf.videoUrl || perf.title.uk || perf.title.en)
});

export const buildOpusContentInput = (
  groupData: GroupData,
  statusToSave?: BaseContentStatuses
): UpdateOpusMutationVariables['input'] => {
  const mappedStatus = mapStatus(statusToSave);

  return {
    ...buildGroupDetailsInput(groupData, mappedStatus),
    ...buildGroupRichContentInput(groupData),
    ...buildGroupMediaInput(groupData)
  };
};
