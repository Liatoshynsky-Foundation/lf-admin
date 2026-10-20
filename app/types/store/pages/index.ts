import type { BlocksMap as AboutUsBlocksMap } from './about-us';
import type { ArchiveBlocksMap } from './archive';
import type { ArtistryBlocksMap } from './artistry';
import type { BlocksMap as PrivacyPolicyBlocksMap } from './privacy-policy';
import type { PublicationsBlocksMap } from './publication';
import type { ResearchBlocksMap } from './research';
import type { BlocksMap as WarInUkraineBlocksMap } from './war-in-ukraine';
export type BlocksMap = AboutUsBlocksMap &
  PrivacyPolicyBlocksMap &
  ArtistryBlocksMap &
  WarInUkraineBlocksMap &
  ArchiveBlocksMap &
  ResearchBlocksMap &
  PublicationsBlocksMap;
