// PublicationForm.tsx
import { Box, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useCallback } from 'react';

import { styles } from './page.styles'; 
import SeoCollapsibleBlock from '~/shared/components/forms/seo-collapsible-block/SeoCollapsibleBlock';
import { SeoCanonicalUrlField } from '~/shared/components/forms/seo-metadata-form/seo-canonicalurl-field/SeoCanonicalUrlField';
import { SeoDateTimeFields } from '~/shared/components/forms/seo-metadata-form/seo-datetime-fields/SeoDateTimeFields';
import { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { PublicationType,useUpsertPublication } from '~/shared/hooks/use-upsert-publication/useUpsertPublication';

const ADMIN_TITLE_LABELS: Record<PublicationType, string> = {
  events: 'Назва події в адмінці',
  news: 'Назва новини в адмінці',
  media: 'Назва публікації в адмінці'
};

interface PublicationViewProps{
  data: ReturnType<typeof useUpsertPublication>;
}

export default function CreatePublicationView({ data }: PublicationViewProps) {
  const {
    publicationType,
    adminTitle,
    setAdminTitle,
    adminTitleError,
    publishDate,
    setPublishDate,
    seoValue,
    setSeoValue,
    forceShowErrors,
    handleDateTimeChange
  } = data;

  const eventsExtraFields = useCallback(
    (_locale: 'uk' | 'en', value: SeoBlockValue['meta']['uk']) => (
      <SeoDateTimeFields
        startDateTime={value.startDateTime}
        endDateTime={value.endDateTime}
        onChange={handleDateTimeChange}
      />
    ),
    [handleDateTimeChange]
  );

  const mediaExtraFields = useCallback(
    (
      _locale: 'uk' | 'en',
      value: SeoBlockValue['meta']['uk'],
      onChange: (val: SeoBlockValue['meta']['uk']) => void
    ) => (
      <SeoCanonicalUrlField
        value={value.canonicalUrl ?? ''}
        onChange={(val) => onChange({ ...value, canonicalUrl: val })}
        onBlur={() => {}}
        forceShowErrors={forceShowErrors}
      />
    ),
    [forceShowErrors]
  );

  let seoExtraFields: typeof eventsExtraFields | typeof mediaExtraFields | undefined;
  if (publicationType === 'events') seoExtraFields = eventsExtraFields;
  else if (publicationType === 'media') seoExtraFields = mediaExtraFields;

  return (
    <Box sx={styles.contentWrapper}>
      <SeoCollapsibleBlock
        title="Деталі"
        defaultExpanded
        sx={styles.seoBlock as object}
        childrenContainerSx={styles.seoBlockChildren as object}
        showAlternativeText
        showTicketUrl={publicationType === 'events'}
        extraFieldsBeforeKeywords={publicationType === 'media'}
        forceShowErrors={forceShowErrors}
        value={seoValue}
        onChange={setSeoValue}
        extraFields={seoExtraFields}
      >
        <TextField
          label={ADMIN_TITLE_LABELS[publicationType]}
          value={adminTitle}
          onChange={(e) => setAdminTitle(e.target.value)}
          error={Boolean(adminTitleError)}
          helperText={adminTitleError}
          sx={styles.textField}
          slotProps={{ input: { sx: styles.textFieldInput } }}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
          <DatePicker
            label="Дата публікації"
            value={publishDate}
            onChange={(newVal) => setPublishDate(newVal)}
            slotProps={{
              textField: { sx: styles.datePickerTextField, InputProps: { sx: styles.datePickerInput } }
            }}
          />
        </LocalizationProvider>
      </SeoCollapsibleBlock>
    </Box>
  );
}
