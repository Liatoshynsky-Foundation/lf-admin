'use client';

import 'dayjs/locale/uk';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Checkbox, Divider, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { SeoBaseFields } from './seo-base-fields/SeoBaseFields';
import { styles } from './SeoMetadataForm.styles';
import { CROP_RATIOS } from '~/constants/publications';
import { ImagePreviewBlock as PhotoBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import TooltipCustom from '~/shared/components/design-system/tooltip/Tooltip';
import { CropRect, CropResult } from '~/types/common';

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
  readonly ogImage: string | null;
  readonly onImageChange: (url: string) => void;
  readonly allowIndexing: boolean;
  readonly onIndexingChange: (val: boolean) => void;
  readonly showAlternativeText?: boolean;
  readonly extraFieldsBeforeKeywords?: boolean;
  readonly forceShowErrors?: boolean;
  readonly extraFields?: (value: LocalizedMeta, onChange: (val: LocalizedMeta) => void) => ReactNode;
  readonly crop?: CropRect | null;
  readonly onChangeCrop?: (crop: CropRect | null) => void;
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
  extraFieldsBeforeKeywords = false,
  forceShowErrors = false,
  crop,
  onChangeCrop,
  extraFields,
  labels = {}
}: SeoMetadataFormProps) {
  const getFileNameFromUrl = (url: string | null) => (url ? url.split('/').pop()?.split('?')[0] : undefined);

  const [ogImagePreview, setOgImagePreview] = useState<string | null>(typeof ogImage === 'string' ? ogImage : null);
  const [displayFileName, setDisplayFileName] = useState<string | undefined>(getFileNameFromUrl(ogImage));
  const [isUploading, setIsUploading] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof LocalizedMeta, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof LocalizedMeta, string>>>({});

  useEffect(() => {
    if (typeof ogImage === 'string') {
      setOgImagePreview(ogImage);
      setDisplayFileName(getFileNameFromUrl(ogImage));
    }
  }, [ogImage]);

  useEffect(() => {
    if (!forceShowErrors) return;
    setTouched((prev) => ({ ...prev, title: true, description: true }));
    setErrors((prev) => ({
      ...prev,
      title: validateField('title', value.title),
      description: validateField('description', value.description)
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceShowErrors]);

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

  const handleImageChange = async (url: string, crop: CropResult | null | undefined) => {
    setIsUploading(true);
    setOgImagePreview(url);
    const fileNameFromUrl = url.split('/').pop()?.split('?')[0];
    setDisplayFileName(fileNameFromUrl || 'image');

    onImageChange(url);
    onChangeCrop?.(crop?.rect ?? null);

    setIsUploading(false);
  };

  const renderPhotoBlock = () => (
    <Stack sx={styles.photoBlock}>
      <Box sx={styles.photoBlockHeader}>
        <Typography variant="subtitle1" sx={styles.photoBlockTitle}>
          {'Зображення для соцмереж'}
        </Typography>
        <TooltipCustom title={'Зображення для соцмереж'}>
          <InfoOutlinedIcon sx={styles.infoIcon} />
        </TooltipCustom>
        <Divider sx={styles.photoBlockHeaderDivider} />
      </Box>
      <PhotoBlock
        imageUrl={ogImagePreview || ''}
        fileName={displayFileName}
        onChangeImage={handleImageChange}
        aspectRatio={CROP_RATIOS.SOCIAL_MEDIA_PREVIEW}
        disabled={isUploading}
        buttonSpacing="8px"
        stackSpacing="0"
        typographySpacing="4px"
        direction="column"
        initialCrop={crop ? { rect: crop } : null}
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
        locale={locale}
      />
      <Typography variant="textMd" sx={styles.ogImageHint}>
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
          showKeywords={!extraFieldsBeforeKeywords}
          labels={labels}
        />
        {extraFields?.(value, onChange)}
        {extraFieldsBeforeKeywords && (
          <TextField
            label={labels.metaKeywords || 'Meta keywords'}
            value={value.keywords || ''}
            onChange={(e) => handleFieldChange('keywords', e.target.value)}
            onBlur={() => handleBlur('keywords')}
            error={Boolean(errors.keywords && touched.keywords)}
            helperText={errors.keywords && touched.keywords ? errors.keywords : ''}
            fullWidth
            sx={styles.textField}
            multiline
            minRows={2}
            maxRows={2}
          />
        )}
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
            />
          }
          sx={styles.indexingCheckbox}
        />
        <TooltipCustom title={'Дозволити індексацію сторінки пошуковими системами'}>
          <InfoOutlinedIcon sx={styles.infoIcon} />
        </TooltipCustom>
      </Box>
    </Box>
  );
}
