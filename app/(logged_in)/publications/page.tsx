'use client';
import { Box, Button } from '@mui/material';
import { useState } from 'react';

import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/SeoMetadataBlock';
import SeoMetadataBlock from '~/shared/components/forms/seo-metadata-form/SeoMetadataBlock';

const defaultSeoValue: SeoBlockValue = {
  meta: {
    ua: { title: '', description: '', keywords: '' },
    en: { title: '', description: '', keywords: '' }
  },
  ogImage: { ua: null, en: null },
  allowIndexing: { ua: true, en: true }
};

export default function PublicationsPage() {
  const [seoData, setSeoData] = useState<SeoBlockValue>(defaultSeoValue);

  const handleSubmit = () => {
    // seoData містить всі дані форми — передай їх в API
    console.log(seoData);
  };

  return (
    <Box>
      <SeoMetadataBlock
        value={seoData}
        onChange={setSeoData}
        showCanonicalUrl={true}
        showAlternativeText={true}
        showDatatimePickers={true}
      />
      <Button onClick={handleSubmit}>Зберегти</Button>
    </Box>
  );
}
