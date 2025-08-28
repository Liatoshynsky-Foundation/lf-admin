export * from './blocks/introSectionBlock';
export * from './blocks/liatoshynskyFoundationBlock';
export * from './blocks/liatoshynskyOfficeBlock';

import type { IntroSectionBlock } from './blocks/introSectionBlock';
import { FoundationInfo } from './blocks/liatoshynskyFoundationBlock';
import type { LiatoshynskyOfficeBlock } from './blocks/liatoshynskyOfficeBlock';
import { OurMissionBlock } from './blocks/missionBlock';

export interface BlocksMap {
  OurMission: OurMissionBlock;
  IntroSection: IntroSectionBlock;
  FoundationInfo: FoundationInfo;
  LiatoshynskyOffice: LiatoshynskyOfficeBlock;
}
