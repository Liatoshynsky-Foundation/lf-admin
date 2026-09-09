'use client';

import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

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
  INITIAL_CONTACT_INFORMATION,
  type SocialNetworkFormItem
} from '~/constants/contacts';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { ContentPageLayout } from '~/shared/components/content-page-layout/ContentPageLayout';
import { EmptyState } from '~/shared/components/empty-state';
import { type ContactsFormErrors } from '~/shared/hooks/use-upsert-contacts/useUpsertContacts';
import { useStore } from '~/store';

const ContactsPageContent = () => {
  const { data, loading } = useContacts();
  const { updateContacts, loading: saving } = useUpsertContacts();

  const locale = useStore((state) => state.locale);
  const setLocale = useStore((state) => state.setLocale);
  const [contactInformation, setContactInformation] = useState<ContactInformation>(INITIAL_CONTACT_INFORMATION);
  const [socialNetworks, setSocialNetworks] = useState<SocialNetworkFormItem[]>([]);
  const [errors, setErrors] = useState<ContactsFormErrors>({ contactInformation: {}, socialNetworks: {} });

  useEffect(() => {
    if (!data) return;

    setContactInformation(data.contactInformation);
    setSocialNetworks(data.socialNetworks.map((socialNetwork, id) => ({ ...socialNetwork, id })));
  }, [data]);

  const handleSave = async () => {
    const validationErrors = await updateContacts({ contactInformation, socialNetworks });
    setErrors(validationErrors ?? { contactInformation: {}, socialNetworks: {} });
  };

  const clearErrors = (section: keyof ContactsFormErrors, ...paths: string[]) => {
    setErrors((currentErrors) => {
      if (!paths.some((path) => path in currentErrors[section])) return currentErrors;

      const nextErrors = { ...currentErrors, [section]: { ...currentErrors[section] } };
      paths.forEach((path) => delete nextErrors[section][path]);
      return nextErrors;
    });
  };

  const handleContactFieldChange = (field: keyof ContactInformation, fieldLocale?: ContactsLocale) => {
    clearErrors('contactInformation', `${field}${fieldLocale ? `.${fieldLocale}` : ''}`);
  };

  const handleSocialNetworkFieldChange = (index: number) => {
    clearErrors('socialNetworks', `${index}.icon`, `${index}.link`);
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
      rightActions={
        <ContactsHeaderActions onLanguageChange={setLocale} onSave={() => void handleSave()} saving={saving} />
      }
    >
      <CollapsibleBlock title="Контакти" defaultExpanded>
        <Box sx={styles.content}>
          <ContactInformationBlock
            data={contactInformation}
            locale={locale}
            onChange={setContactInformation}
            errors={errors.contactInformation}
            onFieldChange={handleContactFieldChange}
          />
          <SocialNetworksBlock
            items={socialNetworks}
            onChange={setSocialNetworks}
            errors={errors.socialNetworks}
            onFieldChange={handleSocialNetworkFieldChange}
          />
        </Box>
      </CollapsibleBlock>
    </ContentPageLayout>
  );
};

export default ContactsPageContent;
