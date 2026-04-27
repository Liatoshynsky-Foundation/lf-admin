'use client';

import 'dayjs/locale/uk';
import { Box, TextField, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { Dayjs } from 'dayjs';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { colors } from '~/shared/components/design-system/button/Button.styles';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import ProgressStatus from '~/shared/components/divided-header/progress-status/ProgressStatus';
import SeoCollapsibleBlock from '~/shared/components/forms/seo-collapsible-block/SeoCollapsibleBlock';
import { SeoCanonicalUrlField } from '~/shared/components/forms/seo-metadata-form/seo-canonicalurl-field/SeoCanonicalUrlField';
import { SeoDateTimeFields } from '~/shared/components/forms/seo-metadata-form/seo-datetime-fields/SeoDateTimeFields';
import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { useCreateEvent } from '~/shared/hooks/use-events/useEvents';
import { useCreateMediaMention } from '~/shared/hooks/use-media-mentions/useMediaMentions';
import { useCreateNews } from '~/shared/hooks/use-news/useNews';
import { EventStatus, MediaStatus, NewsStatus } from '~/types/graphql/generated/graphql';

const VALID_TYPES = ['events', 'news', 'media'] as const;
type PublicationType = (typeof VALID_TYPES)[number];

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const checkIsSeoInvalid = (
  ukMeta: SeoBlockValue['meta']['uk'],
  enMeta: SeoBlockValue['meta']['en'],
  publicationType: PublicationType,
  ticketUrl: SeoBlockValue['ticketUrl']
): boolean => {
  if (!ukMeta.title.trim() || !enMeta.title.trim()) return true;
  if (!ukMeta.description.trim() || !enMeta.description.trim()) return true;
  if (publicationType === 'media') {
    const ukUrl = ukMeta.canonicalUrl ?? '';
    const enUrl = enMeta.canonicalUrl ?? '';
    return !ukUrl.trim() || !enUrl.trim() || !isValidUrl(ukUrl) || !isValidUrl(enUrl);
  }
  if (publicationType === 'events') {
    const ukUrl = ticketUrl?.uk ?? '';
    const enUrl = ticketUrl?.en ?? '';
    return !ukUrl.trim() || !enUrl.trim() || !isValidUrl(ukUrl) || !isValidUrl(enUrl);
  }
  return false;
};

const PAGE_TITLES: Record<PublicationType, string> = {
  events: 'Створення події',
  news: 'Створення новини',
  media: 'Створення ми у ЗМІ'
};

const initialSeoValue: SeoBlockValue = {
  meta: {
    uk: { title: '', description: '', keywords: '' },
    en: { title: '', description: '', keywords: '' }
  },
  ogImage: { uk: null, en: null },
  allowIndexing: { uk: true, en: true }
};

export default function CreatePublicationPage() {
  const params = useParams();
  const router = useRouter();

  const [adminTitle, setAdminTitle] = useState('');
  const [adminTitleError, setAdminTitleError] = useState('');
  const [publishDate, setPublishDate] = useState<Dayjs | null>(null);
  const [seoValue, setSeoValue] = useState<SeoBlockValue>(initialSeoValue);
  const [forceShowErrors, setForceShowErrors] = useState(false);

  const [createEvent] = useCreateEvent();
  const [createNews] = useCreateNews();
  const [createMediaMention] = useCreateMediaMention();

  const type = params?.type as string;

  if (!VALID_TYPES.includes(type as PublicationType)) {
    notFound();
  }

  const publicationType = type as PublicationType;
  const pageTitle = PAGE_TITLES[publicationType];

  const handleSave = async () => {
    const ukMeta = seoValue.meta.uk;
    const enMeta = seoValue.meta.en;

    const isAdminTitleInvalid = !adminTitle.trim();
    const isSeoInvalid = checkIsSeoInvalid(ukMeta, enMeta, publicationType, seoValue.ticketUrl);

    if (isAdminTitleInvalid) setAdminTitleError('Обов\'язкове поле');
    if (isSeoInvalid) setForceShowErrors(true);
    if (isAdminTitleInvalid || isSeoInvalid) return;

    const coverImage = {
      src: {
        uk: seoValue.ogImage?.uk ?? adminTitle,
        en: seoValue.ogImage?.en ?? adminTitle
      },
      alt: {
        uk: ukMeta.altText?.uk || adminTitle,
        en: enMeta.altText?.en || adminTitle
      },
      caption: { uk: adminTitle, en: adminTitle }
    };

    const commonInput = {
      adminTitle,
      title: { uk: adminTitle, en: adminTitle },
      description: {
        uk: adminTitle,
        en: adminTitle,
        meta: {
          metaTitle: { uk: ukMeta.title, en: enMeta.title },
          description: { uk: ukMeta.description, en: enMeta.description },
          ...(publicationType === 'media' && {
            canonicalUrl: { uk: ukMeta.canonicalUrl ?? null, en: enMeta.canonicalUrl ?? null }
          })
        }
      },
      keywords: { uk: ukMeta.keywords || '', en: enMeta.keywords || '' },
      allowIndexation: { uk: seoValue.allowIndexing.uk, en: seoValue.allowIndexing.en },
      coverImage,
      publishedAt: publishDate?.toISOString() ?? undefined
    };

    try {
      if (publicationType === 'events') {
        const result = await createEvent({
          ...commonInput,
          eventLink: adminTitle,
          content: { uk: { content: { blocks: [] } }, en: { content: { blocks: [] } } },
          eventDateTimeStart: ukMeta.startDateTime ?? undefined,
          eventDateTimeEnd: ukMeta.endDateTime ?? undefined,
          ticketUrl: seoValue.ticketUrl ?? undefined,
          status: EventStatus.Draft
        });
        const id = result.data?.createEvent.id;
        if (id) router.push(`/publications/events/${id}/edit`);
      } else if (publicationType === 'news') {
        const result = await createNews({
          ...commonInput,
          content: { uk: { content: { blocks: [] } }, en: { content: { blocks: [] } } },
          newsDate: publishDate?.toISOString() ?? undefined,
          status: NewsStatus.Draft
        });
        const id = result.data?.createNews.id;
        if (id) router.push(`/publications/news/${id}/edit`);
      } else if (publicationType === 'media') {
        const result = await createMediaMention({
          ...commonInput,
          url: ukMeta.canonicalUrl || enMeta.canonicalUrl || adminTitle,
          status: MediaStatus.Draft
        });
        const id = result.data?.createMediaMention.id;
        if (id) router.push('/publications/');
      }
    } catch {
      // errors are handled by safeMutate
    }
  };

  const handleDateTimeChange = useCallback(
    (start: string | undefined, end: string | undefined) => {
      setSeoValue((prev) => ({
        ...prev,
        meta: {
          uk: { ...prev.meta.uk, startDateTime: start, endDateTime: end },
          en: { ...prev.meta.en, startDateTime: start, endDateTime: end }
        }
      }));
    },
    [setSeoValue]
  );

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
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <DividedHeader
        originUrl="/publications"
        rightActionsComponent={<HeaderRightActions mode="create" onEdit={handleSave} onPreview={() => undefined} />}
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
        <SeoCollapsibleBlock
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
          showAlternativeText
          showTicketUrl={publicationType === 'events'}
          extraFieldsBeforeKeywords={publicationType === 'media'}
          forceShowErrors={forceShowErrors}
          value={seoValue}
          onChange={setSeoValue}
          extraFields={seoExtraFields}
        >
          <TextField
            label="Назва новини в адмінці"
            value={adminTitle}
            onChange={(e) => {
              setAdminTitle(e.target.value);
              if (adminTitleError) setAdminTitleError('');
            }}
            error={Boolean(adminTitleError)}
            helperText={adminTitleError}
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
              value={publishDate}
              onChange={(newVal) => setPublishDate(newVal)}
              slotProps={{
                textField: {
                  sx: {
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#190D03'
                    },
                    '& .MuiInputLabel-root:not(.MuiInputLabel-shrunk)': {
                      top: '-3px'
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
        </SeoCollapsibleBlock>
      </Box>
    </Box>
  );
}
