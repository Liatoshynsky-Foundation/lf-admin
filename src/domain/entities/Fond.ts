import { LocalizedString } from './BaseContent';
import { LocalizedJSON } from '~/types/common';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export interface Fond {
    id: string;
    fondNumber: number;
    name: LocalizedString;
    documentCreationDate: LocalizedString;
    chronologicalBoundaries?: LocalizedString;
    organizationForm?: LocalizedString;
    description?: LocalizedJSON;
    status: BaseContentStatuses;
    createdAt: string;
    updatedAt: string;
}
