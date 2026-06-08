import { LocalizedJSON } from '~/types/common';

export type UserRightsItemWithId = {
    id: string;
} & LocalizedJSON

export type UserRightsBlock = {
    title: LocalizedJSON; 
    description: LocalizedJSON; 
    list: UserRightsItemWithId[];
    note: LocalizedJSON; 
}