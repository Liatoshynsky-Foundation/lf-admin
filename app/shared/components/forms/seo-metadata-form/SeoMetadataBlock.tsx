'use client';
import { Box } from '@mui/material';
import { useState } from 'react';

import type { LocalizedMeta } from './SeoMetadataForm';
import SeoMetadataForm from './SeoMetadataForm';

export interface SeoMetadataBlockProps {
  readonly showCanonicalUrl?: boolean;
  readonly showAlternativeText?: boolean;
  [key: string]: any;
}

export default function SeoMetadataBlock({
  showCanonicalUrl = false,
  showAlternativeText = false,
  ...otherProps
}: SeoMetadataBlockProps) {
  const [meta, setMeta] = useState<{
    ua: LocalizedMeta;
    en: LocalizedMeta;
  }>({
    ua: { title: '', description: '', keywords: '', canonicalUrl: undefined },
    en: { title: '', description: '', keywords: '', canonicalUrl: undefined }
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
        showCanonicalUrl={showCanonicalUrl}
        showAlternativeText={showAlternativeText}
        {...otherProps}
      />
      <SeoMetadataForm
        value={meta.en}
        onChange={(newMeta) => setMeta((prev) => ({ ...prev, en: newMeta }))}
        locale="en"
        ogImage={ogImage.en}
        onImageChange={(file) => setOgImage((prev) => ({ ...prev, en: file }))}
        allowIndexing={allowIndexing.en}
        onIndexingChange={(value) => setAllowIndexing((prev) => ({ ...prev, en: value }))}
        showCanonicalUrl={showCanonicalUrl}
        showAlternativeText={showAlternativeText}
        {...otherProps}
      />
    </Box>
  );
}
