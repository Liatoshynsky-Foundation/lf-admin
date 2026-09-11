'use client';

import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useContacts } from '../../../shared/hooks/use-contacts/useContacts';
import {
  type ContactsUpdateInput,
  mapContactsInput,
  useUpsertContacts
} from '../../../shared/hooks/use-upsert-contacts/useUpsertContacts';
import { ContactsHeaderActions } from './ContactsHeaderActions';
import { styles } from './ContactsPageContent.styles';
import { ContactInformationBlock } from './section-blocks/ContactInformationBlock';
import { SocialNetworksBlock } from './section-blocks/SocialNetworksBlock';
import {
  type ContactInformation,
  CONTACTS_ERROR,
  CONTACTS_LOADING,
  CONTACTS_VALIDATION_ERROR,
  type ContactsLocale,
  INITIAL_CONTACT_INFORMATION,
  type SocialNetworkFormItem
} from '~/constants/contacts';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { ContentPageLayout } from '~/shared/components/content-page-layout/ContentPageLayout';
import { EmptyState } from '~/shared/components/empty-state';
import {
  getFormErrorsByPrefix,
  useZodFormValidation
} from '~/shared/hooks/use-zod-form-validation/useZodFormValidation';
import { useStore } from '~/store';
import { zContactsSchema } from '~/validators/contacts.schema';

const ContactsPageContent = () => {
  const { data, loading } = useContacts();
  const { updateContacts, loading: saving } = useUpsertContacts();

  const locale = useStore((state) => state.locale);
  const setLocale = useStore((state) => state.setLocale);
  const [contactInformation, setContactInformation] = useState<ContactInformation>(INITIAL_CONTACT_INFORMATION);
  const [socialNetworks, setSocialNetworks] = useState<SocialNetworkFormItem[]>([]);
  const { errors, validateOnSubmit, revalidateFields, clearFieldErrors, resetValidation } =
    useZodFormValidation({
      validate: (input: ContactsUpdateInput) => zContactsSchema.safeParse(mapContactsInput(input))
    });

  const contactInformationErrors = getFormErrorsByPrefix(errors, 'contactInformation');
  const socialNetworksErrors = getFormErrorsByPrefix(errors, 'socialNetworks');

  useEffect(() => {
    if (!data) return;

    setContactInformation(data.contactInformation);
    setSocialNetworks(data.socialNetworks.map((socialNetwork, id) => ({ ...socialNetwork, id })));
  }, [data]);

  const handleSave = async () => {
    const input = { contactInformation, socialNetworks };
    const validationResult = validateOnSubmit(input);
    if (!validationResult.success) {
      toast.error(CONTACTS_VALIDATION_ERROR);
      return;
    }

    const updateResult = await updateContacts(input);
    if (updateResult) resetValidation();
  };

  const handleContactFieldChange = (field: keyof ContactInformation, fieldLocale?: ContactsLocale) => {
    const fieldPath = ['contactInformation', field, fieldLocale].filter(Boolean).join('.');
    clearFieldErrors(fieldPath);
  };

  const handleSocialNetworkFieldChange = (index: number) => {
    clearFieldErrors(`socialNetworks.${index}.icon`, `socialNetworks.${index}.link`);
  };

  const handleContactFieldBlur = (field: keyof ContactInformation, fieldLocale?: ContactsLocale) => {
    const fieldPath = ['contactInformation', field, fieldLocale].filter(Boolean).join('.');
    revalidateFields({ contactInformation, socialNetworks }, fieldPath);
  };

  const handleSocialNetworkFieldBlur = (index: number) => {
    revalidateFields(
      { contactInformation, socialNetworks },
      `socialNetworks.${index}.icon`,
      `socialNetworks.${index}.link`
    );
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
            errors={contactInformationErrors}
            onFieldChange={handleContactFieldChange}
            onFieldBlur={handleContactFieldBlur}
          />
          <SocialNetworksBlock
            items={socialNetworks}
            onChange={setSocialNetworks}
            errors={socialNetworksErrors}
            onFieldChange={handleSocialNetworkFieldChange}
            onFieldBlur={handleSocialNetworkFieldBlur}
          />
        </Box>
      </CollapsibleBlock>
    </ContentPageLayout>
  );
};

export default ContactsPageContent;
