import { ProseDoc } from '~/types/common';

export type ImageType = {
  src: string;
  alt: { uk: string; en: string };
  caption: { uk: string; en: string };
  generatedSrc: string;
};

export type FoundationInfo = {
  ourOrganisation: Record<'uk' | 'en', ProseDoc>;
  ourName: Record<'uk' | 'en', ProseDoc>;
  ourBelief: Record<'uk' | 'en', ProseDoc>;
  image: ImageType;
  ourMission: {
    title: Record<'uk' | 'en', string>;
    smallImage: ImageType;
    bigImage: ImageType;
    list: Record<'uk' | 'en', ProseDoc>[];
  };
};
