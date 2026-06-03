import { LocalizedJSON } from '~/types/common';

export type UserRightsItem = {
    title: LocalizedJSON; 
    description: LocalizedJSON;
}

export type UserRightsItemWithId = {
    id: string;
} & UserRightsItem

export type UserRightsBlock = {
    title: LocalizedJSON; 
    description: LocalizedJSON; 
    list: LocalizedJSON[];
    note: LocalizedJSON; 
}