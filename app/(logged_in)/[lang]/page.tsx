'use client';

import { Box } from '@mui/material';
import { useLocale,useTranslations } from 'next-intl';
import React, { use } from 'react';

import { fetchPreview } from '~/lib/utils/fetchPreview';
import { Header } from '~/shared/components/header/Header';
import { useStore } from '~/store';

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export default function Home({ params }: Readonly<HomePageProps>) {
  const { lang: _lang } = use(params);

  const t = useTranslations('header');
  const locale = useLocale();

  const discardChanges = useStore((s) => s.discardChanges);

  const pageData = {
    title: t('title'),
    url: '/'
  };

  const onPreview = async () => {
    await fetchPreview({
      slug: pageData.url,
      lang: locale as 'uk' | 'en',
      draftId: '1'
    });
  };

  const onSave = () => {};
  const onCancel = () => discardChanges(pageData.url);

  return (
    <Box>
      <Header
        title={pageData.title}
        onPreview={onPreview}
        onSave={onSave}
        onCancel={onCancel}
        isSaving
      />
    </Box>
  );
}