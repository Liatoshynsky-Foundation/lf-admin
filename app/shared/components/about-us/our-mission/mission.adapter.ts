import { CROP_RATIOS } from '~/constants/publications';
import { ensureIds } from '~/lib/utils/ensureIds';
import type { BlockContentAdapter } from '~/shared/hooks/use-block-content/useBlockContent';
import { CONTENT_TYPE, type ContentItem } from '~/types/blocks/contentTypes';
import type { OurMissionBlock } from '~/types/store/pages/about-us/blocks/missionBlock';

const MISSION_SMALL_IMAGE_PREVIEW_SIZE = {
  width: 188,
  height: 224
} as const;

const MISSION_BIG_IMAGE_PREVIEW_SIZE = {
  width: 395,
  height: 224
} as const;

export const missionAdapter: BlockContentAdapter<OurMissionBlock> = {
  toContent: (block) => [
    { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
    {
      id: 'list',
      type: CONTENT_TYPE.LIST,
      items: ensureIds(block.list ?? []),
      label: 'Текст секції:'
    },
    {
      id: 'smallImage',
      type: CONTENT_TYPE.IMAGE,
      value: block.smallImage,
      label: 'Перше зображення секції',
      aspectRatio: CROP_RATIOS.FUNDATION_PROFILE_SMALL,
      previewWidth: MISSION_SMALL_IMAGE_PREVIEW_SIZE.width,
      previewHeight: MISSION_SMALL_IMAGE_PREVIEW_SIZE.height,
      alignActionsToPreviewBottom: true
    },
    {
      id: 'bigImage',
      type: CONTENT_TYPE.IMAGE,
      value: block.bigImage,
      label: 'Друге зображення секції',
      aspectRatio: CROP_RATIOS.FUNDATION_PROFILE_BIG,
      previewWidth: MISSION_BIG_IMAGE_PREVIEW_SIZE.width,
      previewHeight: MISSION_BIG_IMAGE_PREVIEW_SIZE.height,
      alignActionsToPreviewBottom: true
    }
  ],
  fromContent: (content) => {
    const byId = Object.fromEntries(content.map((item) => [item.id, item]));
    const header = byId.title as Extract<ContentItem, { type: 'header' }> | undefined;
    const list = byId.list as Extract<ContentItem, { type: 'list' }> | undefined;
    const smallImage = byId.smallImage as Extract<ContentItem, { type: 'image' }> | undefined;
    const bigImage = byId.bigImage as Extract<ContentItem, { type: 'image' }> | undefined;

    return {
      ...(header && { title: header.title as OurMissionBlock['title'] }),
      ...(list && { list: list.items as OurMissionBlock['list'] }),
      ...(smallImage && { smallImage: smallImage.value }),
      ...(bigImage && { bigImage: bigImage.value })
    };
  }
};
