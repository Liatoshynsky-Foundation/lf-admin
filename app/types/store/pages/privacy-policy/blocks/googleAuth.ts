import { LocalizedJSON, ProseDoc } from '~/types/common';

export type Item = {
    uk: ProseDoc; 
    en: ProseDoc;
}

export type ItemWithId = {
    id: string; 
} & Item

export type GoogleAuthBlock = {
    title: LocalizedJSON; 
    description: LocalizedJSON; 
    list: LocalizedJSON[];
    note: LocalizedJSON;
}