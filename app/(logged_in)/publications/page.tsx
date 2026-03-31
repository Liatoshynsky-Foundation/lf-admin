'use client';
import { Box } from '@mui/material';
import { useState } from 'react';

import { SeoCanonicalUrlField } from '~/shared/components/forms/seo-metadata-form/seo-canonicalurl-field/SeoCanonicalUrlField';
import { SeoDateTimeFields } from '~/shared/components/forms/seo-metadata-form/seo-datetime-fields/SeoDateTimeFields';
import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import SeoMetadataBlock from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';

const defaultSeoValue: SeoBlockValue = {
  meta: {
    uk: { title: '', description: '', keywords: '' },
    en: { title: '', description: '', keywords: '' }
  },
  ogImage: { uk: null, en: null },
  allowIndexing: { uk: true, en: true }
};

interface MediaMentionExtraFieldsProps {
  readonly locale: 'uk' | 'en';
  readonly seoData: SeoBlockValue;
  readonly onChange: (val: SeoBlockValue) => void;
}

function MediaMentionExtraFields({ locale, seoData, onChange }: MediaMentionExtraFieldsProps) {
  return (
    <>
      <SeoCanonicalUrlField
        value={seoData.meta[locale].canonicalUrl ?? ''}
        onChange={(val) =>
          onChange({ ...seoData, meta: { ...seoData.meta, [locale]: { ...seoData.meta[locale], canonicalUrl: val } } })
        }
        onBlur={() => {}}
      />
      <SeoDateTimeFields
        startDateTime={seoData.meta[locale].startDateTime}
        endDateTime={seoData.meta[locale].endDateTime}
        onChange={(start, end) =>
          onChange({
            ...seoData,
            meta: { ...seoData.meta, [locale]: { ...seoData.meta[locale], startDateTime: start, endDateTime: end } }
          })
        }
      />
    </>
  );
}

export default function PublicationsPage() {
  const [seoData, setSeoData] = useState<SeoBlockValue>(defaultSeoValue);

  return (
    <Box>
      <SeoMetadataBlock
        value={seoData}
        onChange={setSeoData}
        showAlternativeText={true}
        extraFields={(locale) => <MediaMentionExtraFields locale={locale} seoData={seoData} onChange={setSeoData} />}
      />
    </Box>
  );
}
