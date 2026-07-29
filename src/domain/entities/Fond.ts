import { BaseContentStatuses } from '~/types/enums/common.enums';

export interface Fond {
    id: string;
    fondNumber: number;
    name: string;
    documentCreationDate: string;
    chronologicalBoundaries?: string;
    organizationForm?: string;
    description?: string;
    status: BaseContentStatuses;
    createdAt: string;
    updatedAt: string;
}
