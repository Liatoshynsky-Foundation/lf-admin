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
    src: ogImage.uk,
    alt: {
      uk: meta.uk.altText?.uk ?? '',
      en: meta.en.altText?.en ?? ''
    }
  }
});
