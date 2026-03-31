'use client';
import { Box } from '@mui/material';
import { useState } from 'react';

import type { LocalizedMeta } from './SeoMetadataForm';
import SeoMetadataForm from './SeoMetadataForm';

export interface SeoBlockValue {
  meta: { uk: LocalizedMeta; en: LocalizedMeta };
  ogImage: { uk: File | string | null; en: File | string | null };
  allowIndexing: { uk: boolean; en: boolean };
}

const defaultValue: SeoBlockValue = {
  meta: {
    uk: { title: '', description: '', keywords: '', canonicalUrl: undefined },
    en: { title: '', description: '', keywords: '', canonicalUrl: undefined }
  },
  ogImage: { uk: null, en: null },
  allowIndexing: { uk: true, en: true }
};

export interface SeoMetadataBlockProps {
  readonly showCanonicalUrl?: boolean;
  readonly showAlternativeText?: boolean;
  readonly showDatatimePickers?: boolean;
  readonly value?: SeoBlockValue;
  readonly onChange?: (value: SeoBlockValue) => void;
}

export default function SeoMetadataBlock({
  showCanonicalUrl = false,
  showAlternativeText = false,
  showDatatimePickers = false,
  value: externalValue,
  onChange: externalOnChange
}: SeoMetadataBlockProps) {
  const [internalValue, setInternalValue] = useState<SeoBlockValue>(defaultValue);

  const isControlled = externalValue !== undefined && externalOnChange !== undefined;
  const value = isControlled ? externalValue : internalValue;

  const handleChange = (next: SeoBlockValue) => {
    if (isControlled) {
      externalOnChange(next);
    } else {
      setInternalValue(next);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
      <SeoMetadataForm
        value={value.meta.uk}
        onChange={(newMeta) => handleChange({ ...value, meta: { ...value.meta, uk: newMeta } })}
        locale="uk"
        ogImage={value.ogImage.uk}
        onImageChange={(file) => handleChange({ ...value, ogImage: { ...value.ogImage, uk: file } })}
        allowIndexing={value.allowIndexing.uk}
        onIndexingChange={(val) => handleChange({ ...value, allowIndexing: { ...value.allowIndexing, uk: val } })}
        showCanonicalUrl={showCanonicalUrl}
        showAlternativeText={showAlternativeText}
        showDatatimePickers={showDatatimePickers}
      />
      <SeoMetadataForm
        value={value.meta.en}
        onChange={(newMeta) => handleChange({ ...value, meta: { ...value.meta, en: newMeta } })}
        locale="en"
        ogImage={value.ogImage.en}
        onImageChange={(file) => handleChange({ ...value, ogImage: { ...value.ogImage, en: file } })}
        allowIndexing={value.allowIndexing.en}
        onIndexingChange={(val) => handleChange({ ...value, allowIndexing: { ...value.allowIndexing, en: val } })}
        showCanonicalUrl={showCanonicalUrl}
        showAlternativeText={showAlternativeText}
        showDatatimePickers={showDatatimePickers}
      />
    </Box>
  );
}
