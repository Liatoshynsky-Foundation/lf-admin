'use client';

import 'dayjs/locale/uk';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Checkbox, Divider, FormControlLabel, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { SeoBaseFields } from './seo-base-fields/SeoBaseFields';
import { styles } from './SeoMetadataForm.styles';
import { ImagePreviewBlock as PhotoBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import TooltipCustom from '~/shared/components/design-system/tooltip/Tooltip';

export interface LocalizedMeta {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl?: string;
  startDateTime?: string;
  endDateTime?: string;
  altText?: { uk: string; en: string };
}

export interface SeoMetadataFormProps {
  readonly value: LocalizedMeta;
  readonly onChange: (value: LocalizedMeta) => void;
  readonly locale: 'uk' | 'en';
  readonly ogImage: File | string | null;
  readonly onImageChange: (file: File) => void;
  readonly allowIndexing: boolean;
  readonly onIndexingChange: (val: boolean) => void;
  readonly showAlternativeText?: boolean;
  readonly extraFields?: ReactNode;
  readonly labels?: {
    readonly metaTitle?: string;
    readonly metaDescription?: string;
    readonly metaKeywords?: string;
    readonly ogImage?: string;
    readonly ogImageHint?: string;
    readonly allowIndexing?: string;
    readonly sectionTitle?: string;
  };
}

export default function SeoMetadataForm({
  value,
  onChange,
  locale,
  ogImage,
  onImageChange,
  allowIndexing,
  onIndexingChange,
  showAlternativeText = false,
  extraFields,
  labels = {}
}: SeoMetadataFormProps) {
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(typeof ogImage === 'string' ? ogImage : null);
  const [touched, setTouched] = useState<Partial<Record<keyof LocalizedMeta, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof LocalizedMeta, string>>>({});

  const validateField = (field: keyof LocalizedMeta, val: string) => {
    switch (field) {
    case 'title':
    case 'description':
      return val.trim() ? '' : 'Обовʼязкове поле';
    case 'canonicalUrl':
      if (!val) return '';
      try {
        new URL(val);
        return '';
      } catch {
        return 'Некоректний URL';
      }
    case 'keywords':
      if (!val) return '';
      return val.split(',').some((word) => !word.trim())
        ? 'Ключові слова мають бути через кому, без порожніх значень'
        : '';
    default:
      return '';
    }
  };

  const handleBlur = (field: keyof LocalizedMeta) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldValue = typeof value[field] === 'string' ? value[field] : '';
    setErrors((prev) => ({ ...prev, [field]: validateField(field, fieldValue) }));
  };

  const handleFieldChange = (field: keyof LocalizedMeta, val: string) => {
    onChange({ ...value, [field]: val });
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
  };

  const handleImageChange = (file: File) => {
    setOgImagePreview(URL.createObjectURL(file));
    onImageChange(file);
  };

  const renderPhotoBlock = () => (
    <Stack sx={styles.photoBlock}>
      <Box sx={styles.photoBlockHeader}>
        <Typography variant="subtitle1" sx={styles.photoBlockTitle}>
          {'Зображення для соцмереж'}
        </Typography>
        <TooltipCustom title={'Зображення для соцмереж'}>
          <InfoOutlinedIcon sx={{ borderWidth: '1px', width: '16px', height: '16px' }} />
        </TooltipCustom>
        <Divider sx={styles.photoBlockHeaderDivider} />
      </Box>
      <PhotoBlock
        imageUrl={ogImagePreview || ''}
        fileName={typeof ogImage === 'string' ? ogImage : ogImage?.name}
        onChangeImage={handleImageChange}
        buttonSpacing="8px"
        stackSpacing="0"
        typographySpacing="4px"
        showAlternativeText={showAlternativeText}
        altText={value.altText?.[locale] ?? ''}
        onChangeAltText={(alt) =>
          onChange({
            ...value,
            altText: {
              uk: locale === 'uk' ? alt : (value.altText?.uk ?? ''),
              en: locale === 'en' ? alt : (value.altText?.en ?? '')
            }
          })
        }
      />
      <Typography variant="body2" sx={styles.ogImageHint}>
        {'Оптимальний розмір: 1200×630 px.'}
      </Typography>
    </Stack>
  );

  return (
    <Box sx={styles.container}>
      <Typography variant="h6" sx={styles.sectionTitle}>
        {labels.sectionTitle || `Мета дані сторінки | ${locale === 'uk' ? 'UA' : 'EN'}`}
      </Typography>
      <Stack sx={styles.formFieldsContainer}>
        <SeoBaseFields
          value={value}
          errors={errors}
          touched={touched}
          onFieldChange={handleFieldChange}
          onBlur={handleBlur}
          labels={labels}
        />
        {extraFields}
      </Stack>
      {renderPhotoBlock()}
      <Divider sx={styles.divider} />
      <Box sx={styles.indexingCheckboxContainer}>
        <FormControlLabel
          label={'Дозволити індексацію сторінки пошуковими системами'}
          control={
            <Checkbox
              checked={allowIndexing}
              onChange={(e) => onIndexingChange(e.target.checked)}
              sx={styles.indexingCheckbox}
            />
          }
          sx={{
            '& .MuiFormControlLabel-label': {
              color: '#52545A',
              fontSize: '18px',
              fontWeight: 500,
              fontFamily: 'Mulish',
              lineHeight: '150%',
              letterSpacing: 0
            }
          }}
        />
        <TooltipCustom title={'Дозволити індексацію сторінки пошуковими системами'}>
          <InfoOutlinedIcon sx={{ borderWidth: '1px', width: '16px', height: '16px' }} />
        </TooltipCustom>
      </Box>
    </Box>
  );
}
