'use client';

import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { styles } from './EditablePageLayout.styles';
import { Header } from '~/shared/components/header/Header';
import { usePageEditor } from '~/shared/hooks/use-page-editor/usePageEditor';
import { useSavePageBlocks } from '~/shared/hooks/use-save-page/UseSavePage';
import { useStore } from '~/store';
import { useGetPageQuery } from '~/types/graphql/generated/graphql';

interface EditablePageLayoutProps {
    pageSlug: string;
    headerTitle: string;
    children: React.ReactNode;
}

export const EditablePageLayout = ({
  pageSlug,
  headerTitle,
  children
}: EditablePageLayoutProps) => {
  const [isMounted, setIsMounted] = useState(false);

  const setLocale = useStore((s) => s.setLocale);
  const discardChanges = useStore((s) => s.discardChanges);

  const { data, loading: queryLoading } = useGetPageQuery({
    variables: { slug: pageSlug }
  });

  const setPageData = useStore((state) => state.setPageData);

  useEffect(() => {
    if (data?.pageBlocks) {
      setPageData(pageSlug, data.pageBlocks.blocks, data.pageBlocks.blocksOrder, true);
    }
  }, [data, setPageData, pageSlug]);


  const { preview, loading: editorLoading } = usePageEditor(pageSlug);
  const { save, loading: saveLoading } = useSavePageBlocks(pageSlug);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || queryLoading) {
    return null;
  }

  return (
    <Box sx={styles.pageContainer}>
      <Header
        title={headerTitle}
        onPreview={preview}
        onSave={save}
        onCancel={() => discardChanges(pageSlug)}
        isSaving={editorLoading || saveLoading}
        onLanguageChange={(lang: 'uk' | 'en') => setLocale(lang)}
      />
      {children}
    </Box>
  );
};