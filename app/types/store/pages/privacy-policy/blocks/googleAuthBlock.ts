import { LocalizedJSON, ProseDoc } from '~/types/common';

export type GoogleAuthItem = {
    uk: ProseDoc; 
    en: ProseDoc;
}

export type GoogleAuthItemWithId = {
    id: string; 
} & GoogleAuthItem

export type GoogleAuthBlock = {
    title: LocalizedJSON; 
    description: LocalizedJSON; 
    list: LocalizedJSON[];
    note: LocalizedJSON;
}