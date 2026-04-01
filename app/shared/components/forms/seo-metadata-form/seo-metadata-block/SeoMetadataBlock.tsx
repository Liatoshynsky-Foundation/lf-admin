'use client';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';

import type { LocalizedMeta } from '../SeoMetadataForm';
import SeoMetadataForm from '../SeoMetadataForm';

export interface SeoBlockValue {
  meta: { uk: LocalizedMeta; en: LocalizedMeta };
  ogImage: File | string | null;
  allowIndexing: { uk: boolean; en: boolean };
}

const defaultValue: SeoBlockValue = {
  meta: {
    uk: { title: '', description: '', keywords: '', canonicalUrl: undefined },
    en: { title: '', description: '', keywords: '', canonicalUrl: undefined }
  },
  ogImage: null,
  allowIndexing: { uk: true, en: true }
};

export interface SeoMetadataBlockProps {
  readonly showAlternativeText?: boolean;
  readonly value?: SeoBlockValue;
  readonly onChange?: (value: SeoBlockValue) => void;
  readonly extraFields?: (locale: 'uk' | 'en') => ReactNode;
}

export default function SeoMetadataBlock({
  showAlternativeText = false,
  value: externalValue,
  onChange: externalOnChange,
  extraFields
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
        ogImage={value.ogImage}
        onImageChange={(file) => handleChange({ ...value, ogImage: file })}
        allowIndexing={value.allowIndexing.uk}
        onIndexingChange={(val) => handleChange({ ...value, allowIndexing: { ...value.allowIndexing, uk: val } })}
        showAlternativeText={showAlternativeText}
        extraFields={extraFields?.('uk')}
      />
      <SeoMetadataForm
        value={value.meta.en}
        onChange={(newMeta) => handleChange({ ...value, meta: { ...value.meta, en: newMeta } })}
        locale="en"
        ogImage={value.ogImage}
        onImageChange={(file) => handleChange({ ...value, ogImage: file })}
        allowIndexing={value.allowIndexing.en}
        onIndexingChange={(val) => handleChange({ ...value, allowIndexing: { ...value.allowIndexing, en: val } })}
        showAlternativeText={showAlternativeText}
        extraFields={extraFields?.('en')}
      />
    </Box>
  );
}
