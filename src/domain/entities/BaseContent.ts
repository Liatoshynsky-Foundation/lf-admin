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
    caption: LocalizedString;
    isTmp?: boolean;
    width?: number | null;
    height?: number | null;
};

export type BaseContentFields = {
    adminTitle: string;
    title: LocalizedString;
    description: LocalizedString;
    keywords: LocalizedString;
    allowIndexation: LocalizedBoolean;
    slug: string;
    coverImage: LocalizedImage;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    meta: {
        views: number;
    };
};