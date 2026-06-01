export * from './blocks/dataWeCollectBlock';

import { DataUsageBlock } from './blocks/dataUsageBlock';
import type { DataWeCollectBlock } from './blocks/dataWeCollectBlock';

export interface BlocksMap {
    DataWeCollect: DataWeCollectBlock;
    DataUsage: DataUsageBlock;
}