import type { CookiesBlock } from './blocks/cookiesBlock';
import type { DataUsageBlock } from './blocks/dataUsageBlock';
import type { DataWeCollectBlock } from './blocks/dataWeCollectBlock';
import { GoogleAuthBlock } from './blocks/googleAuthBlock';
import { SocialNetworksBlock } from './blocks/socialNetworksBlock';

export interface BlocksMap {
    DataWeCollect: DataWeCollectBlock;
    DataUsage: DataUsageBlock;
    Cookies: CookiesBlock;
    GoogleAuth: GoogleAuthBlock;
    SocialNetworks: SocialNetworksBlock;
}