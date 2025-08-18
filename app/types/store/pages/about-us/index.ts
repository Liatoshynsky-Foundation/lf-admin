export * from './blocks/entrySectionBlock';
export * from './blocks/liatoshynskyFoundationBlock';
export * from './blocks/liatoshynskyOfficeBlock';
export * from './blocks/missionBlock';

import type { EntrySectionBlock } from './blocks/entrySectionBlock';
import type { LiatoshynskyFoundationBlock } from './blocks/liatoshynskyFoundationBlock';
import type { LiatoshynskyOfficeBlock } from './blocks/liatoshynskyOfficeBlock';
import type { MissionBlock } from './blocks/missionBlock';

export interface BlocksMap {
  ourMission: MissionBlock;
  entrySection: EntrySectionBlock;
  liatoshynskyFoundation: LiatoshynskyFoundationBlock;
  liatoshynskyOffice: LiatoshynskyOfficeBlock;
}
