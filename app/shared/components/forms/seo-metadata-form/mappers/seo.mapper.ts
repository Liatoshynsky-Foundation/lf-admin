export type SeoData = {
  meta: {
    uk: {
      title: string;
      description: string;
      keywords: string;
      canonicalUrl?: string;
      altText?: { uk: string; en: string };
    };
    en: {
      title: string;
      description: string;
      keywords: string;
      canonicalUrl?: string;
      altText?: { uk: string; en: string };
    };
  };
  allowIndexing: {
    uk: boolean;
    en: boolean;
  };
  ogImage: {
    uk: string | null;
    en: string | null;
  };
};

export const mapSeoBase = ({ meta, allowIndexing, ogImage }: SeoData) => ({
  description: {
    uk: meta.uk.description,
    en: meta.en.description,
    meta: {
      description: { uk: meta.uk.description, en: meta.en.description },
      canonicalUrl: {
        uk: meta.uk.canonicalUrl ?? null,
        en: meta.en.canonicalUrl ?? null
      },
      metaTitle: { uk: meta.uk.title, en: meta.en.title }
    }
  },
  keywords: {
    uk: meta.uk.keywords,
    en: meta.en.keywords
  },
  allowIndexation: {
    uk: allowIndexing.uk,
    en: allowIndexing.en
  },
  coverImage: {
    src: { uk: ogImage.uk, en: ogImage.en },
    alt: {
      uk: meta.uk.altText?.uk ?? '',
      en: meta.en.altText?.en ?? ''
    }
  }
});
