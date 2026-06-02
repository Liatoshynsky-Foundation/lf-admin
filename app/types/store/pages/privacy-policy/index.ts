import type { CookiesBlock } from './blocks/cookiesBlock';
import type { DataUsageBlock } from './blocks/dataUsageBlock';
import type { DataWeCollectBlock } from './blocks/dataWeCollectBlock';
import type { GoogleAuthBlock } from './blocks/googleAuth';

export interface BlocksMap {
    DataWeCollect: DataWeCollectBlock;
    DataUsage: DataUsageBlock;
    Cookies: CookiesBlock;
    GoogleAuth: GoogleAuthBlock;
}