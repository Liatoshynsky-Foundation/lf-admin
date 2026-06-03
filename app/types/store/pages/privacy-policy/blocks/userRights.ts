import { LocalizedJSON } from '~/types/common';

export type Item = {
    title: LocalizedJSON; 
    description: LocalizedJSON;
}

export type ItemWithId = {
    id: string;
} & Item

export type UserRightsBlock = {
    title: LocalizedJSON; 
    description: LocalizedJSON; 
    list: LocalizedJSON[];
    note: LocalizedJSON; 
}