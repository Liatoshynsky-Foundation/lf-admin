import { LocalizedString } from './BaseContent';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export interface Fund {
    id: string;
    fundNumber: number;
    name: LocalizedString;
    documentCreationDate: LocalizedString;
    chronologicalBoundaries?: LocalizedString;
    organizationForm?: LocalizedString;
    description?: LocalizedString;
    status: BaseContentStatuses;
    casesCount: number;
    descriptionsCount: number;
    createdAt: string;
    updatedAt: string;
}
