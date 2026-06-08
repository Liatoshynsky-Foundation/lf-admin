import { LocalizedJSON } from '~/types/common';

export type GoogleAuthItemWithId = {
    id: string; 
} & LocalizedJSON;

export type GoogleAuthBlock = {
    title: LocalizedJSON; 
    description: LocalizedJSON; 
    list: GoogleAuthItemWithId[];
    note: LocalizedJSON;
}
