'use client';

import 'dayjs/locale/uk';
import { Box, TextField, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { Dayjs } from 'dayjs';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

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
import { EventStatus, MediaStatus, NewsStatus, useUploadBlobMutation } from '~/types/graphql/generated/graphql';

const VALID_TYPES = ['events', 'news', 'media'] as const;
type PublicationType = (typeof VALID_TYPES)[number];

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
  ogImage: null,
  allowIndexing: { uk: true, en: true }
};

export default function CreatePublicationPage() {
  const params = useParams();
  const type = params?.type as string;

  if (!VALID_TYPES.includes(type as PublicationType)) {
    notFound();
  }

  const publicationType = type as PublicationType;
  const pageTitle = PAGE_TITLES[publicationType];

  const router = useRouter();

  const [adminTitle, setAdminTitle] = useState('');
  const [adminTitleError, setAdminTitleError] = useState('');
  const [publishDate, setPublishDate] = useState<Dayjs | null>(null);
  const [seoValue, setSeoValue] = useState<SeoBlockValue>(initialSeoValue);
  const [forceShowErrors, setForceShowErrors] = useState(false);

  const [createEvent] = useCreateEvent();
  const [createNews] = useCreateNews();
  const [createMediaMention] = useCreateMediaMention();
  const [uploadBlob] = useUploadBlobMutation();

  const handleSave = async () => {
    const ukMeta = seoValue.meta.uk;
    const enMeta = seoValue.meta.en;

    const isAdminTitleInvalid = !adminTitle.trim();
    const isSeoInvalid =
      !ukMeta.title.trim() ||
      !enMeta.title.trim() ||
      !ukMeta.description.trim() ||
      !enMeta.description.trim() ||
      (publicationType === 'media' && (!ukMeta.canonicalUrl?.trim() || !enMeta.canonicalUrl?.trim())) ||
      (publicationType === 'events' && !seoValue.ticketUrl?.trim());

    if (isAdminTitleInvalid) setAdminTitleError('Обов\'язкове поле');
    if (isSeoInvalid) setForceShowErrors(true);
    if (isAdminTitleInvalid || isSeoInvalid) return;

    let coverImageSrc = typeof seoValue.ogImage === 'string' ? seoValue.ogImage : adminTitle;
    let isTmp = false;

    try {
      if (seoValue.ogImage instanceof File) {
        const file = seoValue.ogImage;
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const res = await uploadBlob({
          variables: { folderName: 'tmp', blobName: file.name, buffer: base64, contentType: file.type }
        });
        coverImageSrc = res.data?.uploadBlob.blobName ?? adminTitle;
        isTmp = true;
      }
    } catch {
      // photo upload failed, proceed with adminTitle as src fallback
    }

    const coverImage = {
      src: coverImageSrc,
      alt: {
        uk: ukMeta.altText?.uk ?? '',
        en: enMeta.altText?.en ?? ''
      },
      caption: { uk: adminTitle, en: adminTitle },
      isTmp
    };

    const commonInput = {
      adminTitle,
      title: { uk: adminTitle, en: adminTitle },
      description: {
        uk: adminTitle,
        en: adminTitle,
        meta: {
          metaTitle: { uk: ukMeta.title, en: enMeta.title },
          description: { uk: ukMeta.description, en: enMeta.description }
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
          content: { uk: {}, en: {} },
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
          content: { uk: {}, en: {} },
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
        if (id) router.push(`/publications/media/${id}/edit`);
      }
    } catch {
      // errors are handled by safeMutate
    }
  };

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
          extraFields={
            publicationType === 'events'
              ? (_locale, value, onChange) => (
                <SeoDateTimeFields
                  startDateTime={value.startDateTime}
                  endDateTime={value.endDateTime}
                  onChange={(start, end) => onChange({ ...value, startDateTime: start, endDateTime: end })}
                />
              )
              : publicationType === 'media'
                ? (_locale, value, onChange) => (
                  <SeoCanonicalUrlField
                    value={value.canonicalUrl ?? ''}
                    onChange={(val) => onChange({ ...value, canonicalUrl: val })}
                    onBlur={() => {}}
                    forceShowErrors={forceShowErrors}
                  />
                )
                : undefined
          }
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
