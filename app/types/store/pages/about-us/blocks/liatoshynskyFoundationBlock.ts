import { JSONContent } from '@tiptap/react';

import { ImageType } from '~/types/common';

export type FoundationInfo = {
  ourOrganisation: Record<'uk' | 'en', JSONContent>;
  ourName: Record<'uk' | 'en', JSONContent
  >;
  ourBelief: Record<'uk' | 'en', JSONContent>;
  image: ImageType;
  ourMission: {
    title: Record<'uk' | 'en', JSONContent>;
    smallImage: ImageType;
    bigImage: ImageType;
    list: Record<'uk' | 'en', JSONContent>[];
  };
};
