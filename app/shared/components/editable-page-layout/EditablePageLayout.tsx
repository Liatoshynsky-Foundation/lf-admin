'use client';

import { Box, Button, CircularProgress, Divider,Stack, Typography } from '@mui/material';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { styles } from './EditablePageLayout.styles';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { Header } from '~/shared/components/header/Header';
import LanguageSwitcher from '~/shared/components/language-switcher/LanguageSwitcher';
import { usePageEditor } from '~/shared/hooks/use-page-editor/usePageEditor';
import { useSavePageBlocks } from '~/shared/hooks/use-save-page/UseSavePage';
import { useStore } from '~/store';
import { useGetPageQuery } from '~/types/graphql/generated/graphql';

interface EditablePageLayoutProps {
  pageSlug: string;
  headerTitle: string;
  children: React.ReactNode;
  variant?: 'default' | 'simple-layout';
  validateBeforeSave?: () => boolean | 'uk' | 'en';
  blockIdToPublish?: string;
  backHref?: string;
}

export const EditablePageLayout = ({
  pageSlug,
  headerTitle,
  children,
  variant = 'default',
  validateBeforeSave,
  blockIdToPublish,
  backHref
}: EditablePageLayoutProps) => {
  const [isMounted, setIsMounted] = useState(false);

  const setLocale = useStore((s) => s.setLocale);
  const setPageData = useStore((state) => state.setPageData);
  const isChanged = useStore((s) => s.isChanged);
  const discardChanges = useStore((s) => s.discardChanges);
  const hasInvalidFields = useStore((s) => Object.values(s.invalidFields).some(Boolean));
  const setIsSaving = useStore((s) => s.setIsSaving);

  const { data, loading: queryLoading } = useGetPageQuery({
    variables: { slug: pageSlug }
  });

  useEffect(() => {
    if (data?.pageBlocks) {
      setPageData(pageSlug, data.pageBlocks.blocks, data.pageBlocks.blocksOrder, true);
    }
  }, [data, setPageData, pageSlug]);

  const { preview, loading: editorLoading } = usePageEditor(pageSlug);
  const { save, loading: saveLoading } = useSavePageBlocks(pageSlug, blockIdToPublish);
  const isSaving = editorLoading || saveLoading;

  const handleSave = () => {
    if (validateBeforeSave) {
      const validationResult = validateBeforeSave();
      if (validationResult === false) return;
      if (typeof validationResult === 'string') {
        setLocale(validationResult);
        return;
      }
    }
    save();
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsSaving(isSaving);
  }, [isSaving, setIsSaving]);

  const isLoading = !isMounted || queryLoading;
  const renderLoadingContent = () => (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <EditBlockSkeleton />
      <EditBlockSkeleton />
    </Stack>
  );

  const content = isLoading ? renderLoadingContent() : children;

  if (variant === 'simple-layout') {
    return (
      <Box sx={{ width: '100%', bgcolor: 'adminBlue.50', minHeight: '100vh' }}>
        <Stack sx={{ p: '32px 32px 16px 32px' }} direction="row" justifyContent="space-between" bgcolor="white">
          <Stack direction="row" alignItems="center" gap={2}>
            {backHref && (
              <>
                <Link href={backHref} style={{ display: 'flex', alignItems: 'center', color: 'black' }}>
                  <ChevronLeft strokeWidth={1} size={24} />
                </Link>
                <Divider orientation="vertical" flexItem sx={{ my: 1, borderColor: 'grey.400' }} />
              </>
            )}
            <Typography variant="h4" component="h1" fontSize="32px" fontWeight={700} lineHeight={1.4}>
              {headerTitle}
            </Typography>
          </Stack>
          <Stack direction="row" gap={2} alignItems="center">
            <LanguageSwitcher languageSwitcher={setLocale} />
            <Button
              onClick={handleSave}
              disabled={isLoading || !isChanged || saveLoading}
              sx={{
                bgcolor: 'yellow.500',
                width: '120px',
                height: '40px',
                '&:hover': { bgcolor: 'yellow.600' },
                '&.Mui-disabled': {
                  bgcolor: 'yellow.600',
                  color: 'black'
                }
              }}
            >
              {saveLoading ? <CircularProgress size={24} color="inherit" /> : 'Зберегти'}
            </Button>
          </Stack>
        </Stack>
        {isLoading ? <Box sx={{ p: '32px' }}>{content}</Box> : content}
      </Box>
    );
  }

  return (
    <Box sx={styles.pageContainer}>
      <Header
        title={headerTitle}
        onPreview={preview}
        onSave={handleSave}
        isActionsDisabled={isLoading || !isChanged}
        isSaveDisabled={isLoading || hasInvalidFields}
        onCancel={() => discardChanges(pageSlug)}
        isSaving={isSaving}
        onLanguageChange={(lang: 'uk' | 'en') => setLocale(lang)}
      />
      {content}
    </Box>
  );
};
