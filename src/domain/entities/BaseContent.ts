import {CropRect} from '~/types/common';

export type LocalizedString = {
    uk: string;
    en: string;
};

export type LocalizedBoolean = {
    uk: boolean;
    en: boolean;
};

export type LocalizedContent = {
    uk: unknown;
    en: unknown;
};

export type LocalizedImage = {
    src: string;
    alt: LocalizedString;
    caption?: LocalizedString;
    isTmp?: boolean;
    crop?: CropRect | null;
};

export type BaseContentFields = {
    adminTitle: string;
    title: LocalizedString;
    description: {
        uk: string;
        en: string;
        meta?: {
            description?: { uk: string; en: string };
            canonicalUrl?: { uk: string; en: string };
            metaTitle?: { uk: string; en: string };
        };
    };
    keywords: LocalizedString;
    allowIndexation: LocalizedBoolean;
    slug: string;
    coverImage: LocalizedImage;
    publishedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    meta: {
        views: number;
    };
};