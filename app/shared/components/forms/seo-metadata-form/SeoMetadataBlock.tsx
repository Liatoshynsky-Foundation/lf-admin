'use client';
import { Box } from '@mui/material';
import { useState } from 'react';

import SeoMetadataForm from './SeoMetadataForm';

export default function SeoMetadataBlock() {
  const [meta, setMeta] = useState({
    ua: { title: '', description: '', keywords: '' },
    en: { title: '', description: '', keywords: '' }
  });
  const [ogImage, setOgImage] = useState<{
    ua: File | string | null;
    en: File | string | null;
  }>({
    ua: null,
    en: null
  });
  const [allowIndexing, setAllowIndexing] = useState<{
    ua: boolean;
    en: boolean;
  }>({
    ua: true,
    en: true
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
      <SeoMetadataForm
        value={meta.ua}
        onChange={(newMeta) => setMeta((prev) => ({ ...prev, ua: newMeta }))}
        locale="ua"
        ogImage={ogImage.ua}
        onImageChange={(file) => setOgImage((prev) => ({ ...prev, ua: file }))}
        allowIndexing={allowIndexing.ua}
        onIndexingChange={(value) => setAllowIndexing((prev) => ({ ...prev, ua: value }))}
        showCanonicalUrl={true}
      />{' '}
      <SeoMetadataForm
        value={meta.en}
        onChange={(newMeta) => setMeta((prev) => ({ ...prev, en: newMeta }))}
        locale="en"
        ogImage={ogImage.en}
        onImageChange={(file) => setOgImage((prev) => ({ ...prev, en: file }))}
        allowIndexing={allowIndexing.en}
        onIndexingChange={(value) => setAllowIndexing((prev) => ({ ...prev, en: value }))}
        showCanonicalUrl={true}
      />
    </Box>
  );
}
