export type SeoData = {
  meta: {
    uk: { title: string; description: string; keywords: string; canonicalUrl?: string };
    en: { title: string; description: string; keywords: string; canonicalUrl?: string };
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
    en: meta.en.description
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
    uk: typeof ogImage.uk === 'string' ? ogImage.uk : null,
    en: typeof ogImage.en === 'string' ? ogImage.en : null
  }
});
