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

export default function PublicationsPage() {
  const [seoData, setSeoData] = useState<SeoBlockValue>(defaultSeoValue);

  return (
    <Box>
      <SeoMetadataBlock
        value={seoData}
        onChange={setSeoData}
        showAlternativeText={true}
        extraFields={(locale) => (
          <>
            <SeoCanonicalUrlField
              value={seoData.meta[locale].canonicalUrl ?? ''}
              onChange={(val) =>
                setSeoData((prev) => ({
                  ...prev,
                  meta: { ...prev.meta, [locale]: { ...prev.meta[locale], canonicalUrl: val } }
                }))
              }
              onBlur={() => {}}
            />
            <SeoDateTimeFields
              startDateTime={seoData.meta[locale].startDateTime}
              endDateTime={seoData.meta[locale].endDateTime}
              onChange={(start, end) =>
                setSeoData((prev) => ({
                  ...prev,
                  meta: { ...prev.meta, [locale]: { ...prev.meta[locale], startDateTime: start, endDateTime: end } }
                }))
              }
            />
          </>
        )}
      />
    </Box>
  );
}
