export * from './blocks/introSectionBlock';
export * from './blocks/liatoshynskyFoundationBlock';
export * from './blocks/liatoshynskyOfficeBlock';
export * from './blocks/missionBlock';
export * from './blocks/ourGoalsBlock';
export * from './blocks/whatWeDoBlock';

import type { IntroSectionBlock } from './blocks/introSectionBlock';
import type { FoundationInfo } from './blocks/liatoshynskyFoundationBlock';
import type { LiatoshynskyOfficeBlock } from './blocks/liatoshynskyOfficeBlock';
import type { OurMissionBlock } from './blocks/missionBlock';
import type { OurGoalsBlock } from './blocks/ourGoalsBlock';
import type { WhatWeDoBlock } from './blocks/whatWeDoBlock';

export interface BlocksMap {
  OurMission: OurMissionBlock;
  IntroSection: IntroSectionBlock;
  FoundationInfo: FoundationInfo;
  LiatoshynskyOffice: LiatoshynskyOfficeBlock;
  OurGoals: OurGoalsBlock;
  WhatWeDo: WhatWeDoBlock;
}
