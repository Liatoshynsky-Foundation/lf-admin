export type SeoData = {
  meta: {
    ua: { title: string; description: string; keywords: string; canonicalUrl?: string };
    en: { title: string; description: string; keywords: string; canonicalUrl?: string };
  };
  allowIndexing: {
    ua: boolean;
    en: boolean;
  };
  ogImage: {
    ua: File | string | null;
    en: File | string | null;
  };
};

export const mapSeoBase = ({ meta, allowIndexing, ogImage }: SeoData) => ({
  title: {
    ua: meta.ua.title,
    en: meta.en.title
  },
  description: {
    ua: meta.ua.description,
    en: meta.en.description
  },
  keywords: {
    ua: meta.ua.keywords,
    en: meta.en.keywords
  },
  allowIndexation: {
    ua: allowIndexing.ua,
    en: allowIndexing.en
  },
  coverImage: {
    ua: typeof ogImage.ua === 'string' ? ogImage.ua : null,
    en: typeof ogImage.en === 'string' ? ogImage.en : null
  }
});
