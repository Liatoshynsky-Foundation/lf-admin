import type { BlocksMap as AboutUsBlocksMap } from './about-us';
import type { ArtistryBlocksMap } from './artistry';
import type { BlocksMap as PrivacyPolicyBlocksMap } from './privacy-policy';
import type { BlocksMap as WarInUkraineBlocksMap} from './war-in-ukraine';

export type BlocksMap = AboutUsBlocksMap & PrivacyPolicyBlocksMap & ArtistryBlocksMap & WarInUkraineBlocksMap;
