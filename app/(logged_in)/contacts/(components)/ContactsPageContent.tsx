'use client';

import { Box, Typography } from '@mui/material';
import { useState } from 'react';

import { useContacts } from '../../../shared/hooks/use-contacts/useContacts';
import { useUpsertContacts } from '../../../shared/hooks/use-upsert-contacts/useUpsertContacts';
import { ContactsHeaderActions } from './ContactsHeaderActions';
import { styles } from './ContactsPageContent.styles';
import { ContactInformationBlock } from './section-blocks/ContactInformationBlock';
import { SocialNetworksBlock } from './section-blocks/SocialNetworksBlock';
import {
  type ContactInformation,
  CONTACTS_ERROR,
  CONTACTS_LOADING,
  type ContactsLocale,
  INIT_LOCALE,
  type SocialNetworkFormItem
} from '~/constants/contacts';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { ContentPageLayout } from '~/shared/components/content-page-layout/ContentPageLayout';
import { EmptyState } from '~/shared/components/empty-state';

const ContactsPageContent = () => {
  const { data, loading } = useContacts();
  const { updateContacts } = useUpsertContacts();

  const [locale, setLocale] = useState<ContactsLocale>(INIT_LOCALE);
  const [contactInformation, setContactInformation] = useState<ContactInformation | null>(data?.contactInformation ?? null);
  const [socialNetworks, setSocialNetworks] = useState<SocialNetworkFormItem[]>(() =>
    data?.socialNetworks.map((socialNetwork, id) => ({ ...socialNetwork, id })) ?? []
  );

  const handleSave = () => {
    if (contactInformation) updateContacts({ contactInformation, socialNetworks });
  };

  if (loading) {
    return <EmptyState title={CONTACTS_LOADING.title} description={CONTACTS_LOADING.description} />;
  }

  if (!data) {
    return <EmptyState title={CONTACTS_ERROR.title} description={CONTACTS_ERROR.description} />;
  }

  return (
    <ContentPageLayout
      title={<Typography variant="h4">Контакти</Typography>}
      showBackButton={false}
      rightActions={<ContactsHeaderActions onLanguageChange={setLocale} onSave={handleSave} />}
    >
      <CollapsibleBlock title="Контакти" defaultExpanded>
        <Box sx={styles.content}>
          {contactInformation && (
            <ContactInformationBlock data={contactInformation} locale={locale} onChange={setContactInformation} />
          )}
          <SocialNetworksBlock items={socialNetworks} onChange={setSocialNetworks} />
        </Box>
      </CollapsibleBlock>
    </ContentPageLayout>
  );
};

export default ContactsPageContent;
