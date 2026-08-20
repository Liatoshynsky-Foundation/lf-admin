'use client';

import 'dayjs/locale/uk';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Checkbox, Divider, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { SeoBaseFields } from './seo-base-fields/SeoBaseFields';
import { styles } from './SeoMetadataForm.styles';
import { type SeoField, validateSeoField } from './validateSeoField';
import { seoFormErrors } from '~/constants/errors';
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
  readonly required?: boolean;
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

const getFileNameFromUrl = (url: string | null): string | undefined =>
  url ? url.split('/').pop()?.split('?')[0] : undefined;

const isValidHttpUrl = (url: string | null): boolean => {
  if (!url) return false;

  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

const seoFields = new Set<SeoField>(['title', 'description', 'keywords', 'canonicalUrl', 'altText']);

const getSeoFieldError = (
  field: keyof LocalizedMeta,
  value: string,
  locale: 'uk' | 'en',
  formRequired: boolean,
  hasOgImage: boolean
): string => {
  if (!seoFields.has(field as SeoField)) return '';

  const required = field === 'altText' ? hasOgImage : formRequired || Boolean(value.trim());
  const validationError = validateSeoField(field as SeoField, value, { required });

  return validationError ? seoFormErrors[locale][validationError] : '';
};

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
  required = true,
  forceShowErrors = false,
  crop,
  onChangeCrop,
  extraFields,
  labels = {}
}: SeoMetadataFormProps) {
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(isValidHttpUrl(ogImage) ? ogImage : null);
  const [displayFileName, setDisplayFileName] = useState<string | undefined>(
    isValidHttpUrl(ogImage) ? getFileNameFromUrl(ogImage) : undefined
  );
  const [isUploading, setIsUploading] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof LocalizedMeta, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof LocalizedMeta, string>>>({});

  useEffect(() => {
    if (isValidHttpUrl(ogImage)) {
      setOgImagePreview(ogImage);
      setDisplayFileName(getFileNameFromUrl(ogImage));
    } else {
      setOgImagePreview(null);
      setDisplayFileName(undefined);
    }
  }, [ogImage]);

  useEffect(() => {
    if (!forceShowErrors) return;
    setTouched((prev) => ({ ...prev, title: true, description: true, keywords: true, altText: true }));
    setErrors((prev) => ({
      ...prev,
      title: getSeoFieldError('title', value.title, locale, required, Boolean(ogImage)),
      description: getSeoFieldError('description', value.description, locale, required, Boolean(ogImage)),
      keywords: getSeoFieldError('keywords', value.keywords, locale, required, Boolean(ogImage)),
      altText: getSeoFieldError('altText', value.altText?.[locale] ?? '', locale, required, Boolean(ogImage))
    }));
  }, [forceShowErrors, locale, ogImage, required, value.altText, value.description, value.keywords, value.title]);

  const handleBlur = (field: keyof LocalizedMeta) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    let fieldValue = '';

    if (field === 'altText') {
      fieldValue = value.altText?.[locale] ?? '';
    } else if (typeof value[field] === 'string') {
      fieldValue = value[field];
    }

    setErrors((prev) => ({
      ...prev,
      [field]: getSeoFieldError(field, fieldValue, locale, required, Boolean(ogImage))
    }));
  };

  const handleFieldChange = (field: keyof LocalizedMeta, val: string) => {
    onChange({ ...value, [field]: val });
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: getSeoFieldError(field, val, locale, required, Boolean(ogImage))
      }));
    }
  };

  const handleAltTextChange = (val: string) => {
    const nextValue = {
      ...value,
      altText: {
        uk: locale === 'uk' ? val : (value.altText?.uk ?? ''),
        en: locale === 'en' ? val : (value.altText?.en ?? '')
      }
    };

    onChange(nextValue);
    if (touched.altText) {
      setErrors((prev) => ({
        ...prev,
        altText: getSeoFieldError('altText', val, locale, required, Boolean(ogImage))
      }));
    }
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
        <Typography variant="subtitle2" sx={styles.photoBlockTitle}>
          {'Зображення для соцмереж'}
        </Typography>
        <Divider sx={styles.photoBlockHeaderDivider} />
      </Box>
      <PhotoBlock
        imageUrl={ogImagePreview || ''}
        fileName={displayFileName}
        onChangeImage={handleImageChange}
        aspectRatio={CROP_RATIOS.GROUP_PHOTO}
        disabled={isUploading}
        buttonSpacing="8px"
        stackSpacing="0"
        typographySpacing="4px"
        direction="column"
        initialCrop={crop ? { rect: crop } : null}
        showAlternativeText={showAlternativeText}
        altText={value.altText?.[locale] ?? ''}
        onChangeAltText={handleAltTextChange}
        onBlurAltText={() => handleBlur('altText')}
        altTextErrorState={Boolean(errors.altText && touched.altText)}
        altTextError={errors.altText && touched.altText ? errors.altText : ''}
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
          required={required}
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
          control={<Checkbox checked={allowIndexing} onChange={(e) => onIndexingChange(e.target.checked)} />}
          sx={styles.indexingCheckbox}
        />
        <TooltipCustom title={'Дозволити індексацію сторінки пошуковими системами'}>
          <InfoOutlinedIcon sx={styles.infoIcon} />
        </TooltipCustom>
      </Box>
    </Box>
  );
}
