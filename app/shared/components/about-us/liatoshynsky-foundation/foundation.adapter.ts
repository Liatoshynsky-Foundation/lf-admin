import { CROP_RATIOS } from '~/constants/publications';
import type { BlockContentAdapter } from '~/shared/hooks/use-block-content/useBlockContent';
import { CONTENT_TYPE, type ContentItem } from '~/types/blocks/contentTypes';
import type { FoundationInfo } from '~/types/store/pages/about-us/blocks/liatoshynskyFoundationBlock';

export const foundationAdapter: BlockContentAdapter<FoundationInfo> = {
  toContent: (block) => [
    { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
    {
      id: 'ourOrganisation',
      type: CONTENT_TYPE.PARAGRAPH,
      value: block.ourOrganisation,
      label: 'Основний текст секції'
    },
    {
      id: 'ourName',
      type: CONTENT_TYPE.PARAGRAPH,
      value: block.ourName,
      label: 'Текст 1 абзацу'
    },
    {
      id: 'ourBelief',
      type: CONTENT_TYPE.PARAGRAPH,
      value: block.ourBelief,
      label: 'Текст 2 абзацу'
    },
    {
      id: 'image',
      type: CONTENT_TYPE.IMAGE,
      value: block.image,
      label: 'Основне зображення',
      aspectRatio: CROP_RATIOS.FUNDATION_PROFILE_SMALL,
      showCaption: false
    }
  ],
  fromContent: (content) => {
    const byId = Object.fromEntries(content.map((item) => [item.id, item]));

    return {
      title: (byId.title as Extract<ContentItem, { type: 'header' }>)?.title,
      ourOrganisation: (byId.ourOrganisation as Extract<ContentItem, { type: 'paragraph' }>)?.value,
      ourName: (byId.ourName as Extract<ContentItem, { type: 'paragraph' }>)?.value,
      ourBelief: (byId.ourBelief as Extract<ContentItem, { type: 'paragraph' }>)?.value,
      image: (byId.image as Extract<ContentItem, { type: 'image' }>)?.value
    };
  }
};
