export type SeoData = {
  meta: {
    uk: {
      title: string;
      description: string;
      keywords: string;
      canonicalUrl?: string;
      startDateTime?: string;
      endDateTime?: string;
      altText?: { uk: string; en: string };
    };
    en: {
      title: string;
      description: string;
      keywords: string;
      canonicalUrl?: string;
      startDateTime?: string;
      endDateTime?: string;
      altText?: { uk: string; en: string };
    };
  };
  allowIndexing: {
    uk: boolean;
    en: boolean;
  };
  ogImage: {
    uk: File | string | null;
    en: File | string | null;
  };
};

export const mapSeoBase = ({ meta, allowIndexing, ogImage }: SeoData) => ({
  title: {
    uk: meta.uk.title,
    en: meta.en.title
  },
  description: {
    uk: meta.uk.description,
    en: meta.en.description,
    meta: {
      canonicalUrl: meta.uk.canonicalUrl ?? null
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
    src: typeof ogImage.uk === 'string' ? ogImage.uk : null,
    alt: {
      uk: meta.uk.altText?.uk ?? '',
      en: meta.en.altText?.en ?? ''
    }
  }
});
