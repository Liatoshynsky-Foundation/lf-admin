'use client';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Checkbox, Divider, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { styles } from './SeoMetadataForm.styles';
import { ImagePreviewBlock as PhotoBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import TooltipCustom from '~/shared/components/design-system/tooltip/Tooltip';

export interface LocalizedMeta {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl?: string;
}

export interface SeoMetadataFormProps {
  value: LocalizedMeta;
  onChange: (value: LocalizedMeta) => void;
  locale: 'ua' | 'en';
  ogImage: File | string | null;
  onImageChange: (file: File) => void;
  allowIndexing: boolean;
  onIndexingChange: (val: boolean) => void;
  showCanonicalUrl?: boolean;
  labels?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    ogImageHint?: string;
    allowIndexing?: string;
    sectionTitle?: string;
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
  showCanonicalUrl = false,
  labels = {}
}: SeoMetadataFormProps) {
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(typeof ogImage === 'string' ? ogImage : null);

  const handleFieldChange = (field: keyof LocalizedMeta, val: string) => {
    onChange({ ...value, [field]: val });
  };

  const handleImageChange = (file: File) => {
    setOgImagePreview(URL.createObjectURL(file));
    onImageChange(file);
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="h6" sx={styles.sectionTitle}>
        {labels.sectionTitle || `Мета дані сторінки | ${locale.toUpperCase()}`}
      </Typography>
      <Stack sx={styles.formFields}>
        <TextField
          label={labels.metaTitle || 'Meta title'}
          value={value.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          fullWidth
          margin="normal"
          sx={styles.textField}
          required
        />
        <TextField
          label={labels.metaDescription || 'Meta description'}
          value={value.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          fullWidth
          margin="normal"
          required
          multiline
          minRows={2}
          sx={styles.textField}
        />{' '}
        {showCanonicalUrl && (
          <TextField
            label={labels.canonicalUrl || 'Canonical URL'}
            value={value.canonicalUrl || ''}
            onChange={(e) => handleFieldChange('canonicalUrl', e.target.value)}
            fullWidth
            margin="normal"
            sx={styles.textField}
          />
        )}
        <TextField
          label={labels.metaKeywords || 'Meta keywords'}
          value={value.keywords}
          onChange={(e) => handleFieldChange('keywords', e.target.value)}
          fullWidth
          margin="normal"
          sx={styles.textField}
        />
      </Stack>
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
          cropWidth={1200}
          cropHeight={630}
          onChangeImage={handleImageChange}
          title={labels.ogImage || 'Назва файлу зображення'}
          editorMode="mediaModal"
        />
        <Typography variant="body2" sx={styles.ogImageHint}>
          {'Оптимальний розмір: 1200×630 px.'}
        </Typography>
      </Stack>
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
              color: '#555',
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
