'use client';
import { Box } from '@mui/material';

import { PAGE_IDS } from '~/constants/pageBlocks';
import { Header } from '~/shared/components/header/Header';
import { ContactUs } from '~/shared/components/privacy-policy/contact-us/ContactUs';
import { DataRetention } from '~/shared/components/privacy-policy/data-retention/DataRetention';
import { DataUsage } from '~/shared/components/privacy-policy/data-usage/DataUsage';
import { DataWeCollect } from '~/shared/components/privacy-policy/data-we-collect/DataWeCollect';
import { GoogleAuth } from '~/shared/components/privacy-policy/google-auth/GoogleAuth';
import { IntroSection } from '~/shared/components/privacy-policy/intro-section/IntroSection';
import { NewsletterSubscription } from '~/shared/components/privacy-policy/newsletter-subscription/NewsletterSubscription';
import { SocialNetworks } from '~/shared/components/privacy-policy/social-networks/SocialNetworks';
import { TargetedAds } from '~/shared/components/privacy-policy/targeted-ads/TargetedAds';
import { UserRights } from '~/shared/components/privacy-policy/user-rights/UserRights';
import { Cookies } from '~/shared/components/privacy-policy/сookies/Cookies';
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
      <IntroSection />
      <DataWeCollect />
      <DataUsage />
      <Cookies />
      <GoogleAuth />
      <SocialNetworks />
      <TargetedAds />
      <NewsletterSubscription />
      <DataRetention />
      <UserRights />
      <ContactUs />
    </Box>
  );
}
