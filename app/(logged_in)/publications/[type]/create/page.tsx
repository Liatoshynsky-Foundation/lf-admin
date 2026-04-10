'use client';

import 'dayjs/locale/uk';
import { Box, TextField, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { notFound, useParams } from 'next/navigation';
import { useState } from 'react';

import { colors } from '~/shared/components/design-system/button/Button.styles';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import ProgressStatus from '~/shared/components/divided-header/progress-status/ProgressStatus';
import { SeoCanonicalUrlField } from '~/shared/components/forms/seo-metadata-form/seo-canonicalurl-field/SeoCanonicalUrlField';
import { SeoDateTimeFields } from '~/shared/components/forms/seo-metadata-form/seo-datetime-fields/SeoDateTimeFields';
import SeoMetadataBlock from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';

const VALID_TYPES = ['events', 'news', 'media'] as const;
type PublicationType = (typeof VALID_TYPES)[number];

const PAGE_TITLES: Record<PublicationType, string> = {
  events: 'Створення події',
  news: 'Створення новини',
  media: 'Створення ми у ЗМІ'
};

export default function CreatePublicationPage() {
  const params = useParams();
  const type = params?.type as string;

  if (!VALID_TYPES.includes(type as PublicationType)) {
    notFound();
  }

  const publicationType = type as PublicationType;
  const pageTitle = PAGE_TITLES[publicationType];

  const [eventStart, setEventStart] = useState<string | undefined>(undefined);
  const [eventEnd, setEventEnd] = useState<string | undefined>(undefined);
  const [canonicalUrl, setCanonicalUrl] = useState({ uk: '', en: '' });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <DividedHeader
        originUrl="/publications"
        rightActionsComponent={
          <HeaderRightActions mode="create" onEdit={() => undefined} onPreview={() => undefined} />
        }
      >
        <Typography variant="customBold20Tight">{pageTitle}</Typography>
        <ProgressStatus isSaved />
      </DividedHeader>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          mx: '32px',
          mt: '16px',
          mb: '32px',
          width: 'calc(100% - 64px)'
        }}
      >
        <CollapsibleBlock
          title="Деталі"
          defaultExpanded
          sx={{
            backgroundColor: colors.white,
            padding: '24px',
            '& .MuiAccordionSummary-content': { margin: '0 0 24px' },
            '& .MuiAccordion-heading': { '& .MuiButtonBase-root': { padding: 0 } }
          }}
          childrenContainerSx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            padding: 0
          }}
        >
          <TextField
            label="Назва новини в адмінці"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderRadius: '8px',
                  borderColor: colors.blue[500],
                  borderWidth: '1px',
                  borderStyle: 'solid'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(25, 13, 3, 0.5)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.black,
                  borderWidth: '1px'
                },
                '&.Mui-disabled fieldset': {
                  borderColor: 'rgba(25, 13, 3, 0.25)'
                },
                '&.Mui-error fieldset': {
                  borderColor: '#E63C14'
                }
              },
              '& .MuiInputLabel-root': {
                color: colors.blue[800]
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: colors.blue[800]
              },
              '& .MuiInputBase-root': {
                height: '48px'
              }
            }}
            slotProps={{ input: { sx: { padding: '0 16px' } } }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
            <DatePicker
              label="Дата публікації"
              slotProps={{
                textField: {
                  sx: {
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#190D03'
                    },
                    width: '238px',
                    '& .MuiPickersOutlinedInput-root.Mui-focused:not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline':
                      {
                        borderColor: '#190D03',
                        borderWidth: '1px'
                      }
                  },
                  InputProps: {
                    sx: {
                      borderRadius: '8px',
                      height: '48px'
                    }
                  }
                }
              }}
            />
          </LocalizationProvider>
        </CollapsibleBlock>

        <SeoMetadataBlock
          showAlternativeText
          showTicketUrl={publicationType === 'events'}
          extraFields={
            publicationType === 'events'
              ? () => (
                <SeoDateTimeFields
                  startDateTime={eventStart}
                  endDateTime={eventEnd}
                  onChange={(start, end) => {
                    setEventStart(start);
                    setEventEnd(end);
                  }}
                />
              )
              : publicationType === 'media'
                ? (locale) => (
                  <SeoCanonicalUrlField
                    value={canonicalUrl[locale]}
                    onChange={(val) => setCanonicalUrl((prev) => ({ ...prev, [locale]: val }))}
                    onBlur={() => {}}
                  />
                )
                : undefined
          }
        />
      </Box>
    </Box>
  );
}
