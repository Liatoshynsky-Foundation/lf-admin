'use client';
import { Box } from '@mui/material';

import { PAGE_IDS } from '~/constants/pageBlocks';
import { Header } from '~/shared/components/header/Header';
import { Cookies } from '~/shared/components/privacy-policy/Cookies/Cookies';
import { DataUsage } from '~/shared/components/privacy-policy/DataUsage/DataUsage';
import { DataWeCollect } from '~/shared/components/privacy-policy/DataWeCollect/DataWeCollect';
import { GoogleAuth } from '~/shared/components/privacy-policy/GoogleAuth/GoogleAuth';
import { usePageEditor } from '~/shared/hooks/use-page-editor/usePageEditor';
import { useSavePageBlocks } from '~/shared/hooks/use-save-page/UseSavePage';
import { useStore } from '~/store';


export default function Page() {
  const pageSlug = PAGE_IDS.PRIVACY_POLICY;

  const setLocale = useStore((s) => s.setLocale);
  const discardChanges = useStore((s) => s.discardChanges);

  const { preview, loading: editorLoading } = usePageEditor(pageSlug);
  const { save, loading: saveLoading } = useSavePageBlocks(pageSlug);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', p: '32px', width: '100%', gap: '32px' }}>
      <Header
        title="Політика конфіденційності"
        onPreview={preview}
        onSave={save}
        onCancel={() => discardChanges(pageSlug)}
        isSaving={editorLoading || saveLoading}
        onLanguageChange={(lang: 'uk' | 'en') => setLocale(lang)}
      />
      <DataWeCollect />
      <DataUsage />
      <Cookies />
      <GoogleAuth />
    </Box>
  );
}
