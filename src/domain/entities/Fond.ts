import { LocalizedString } from './BaseContent';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export interface Fond {
    id: string;
    fondNumber: number;
    name: LocalizedString;
    documentCreationDate: LocalizedString;
    chronologicalBoundaries?: LocalizedString;
    organizationForm?: LocalizedString;
    description?: LocalizedString;
    status: BaseContentStatuses;
    createdAt: string;
    updatedAt: string;
}
