export * from './blocks/principleOfHope';
export * from './blocks/volunteerDonation';
export * from './blocks/warCarousel';
export * from './blocks/warInfo';
export * from './blocks/yermolenkoLinks';

import type { PrincipleOfHopeBlock } from './blocks/principleOfHope';
import type { VolunteerDonationBlock } from './blocks/volunteerDonation';
import type { WarCarouselBlock } from './blocks/warCarousel';
import type { WarInfoBlock } from './blocks/warInfo';
import type { YermolenkoLinksBlock } from './blocks/yermolenkoLinks';

export interface BlocksMap {
  WarInfo: WarInfoBlock;
  PrincipleOfHope: PrincipleOfHopeBlock;
  WarCarousel: WarCarouselBlock;
  YermolenkoLinks: YermolenkoLinksBlock;
  VolunteerDonation: VolunteerDonationBlock;
}