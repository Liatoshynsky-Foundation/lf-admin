'use client';

import { Box, Typography } from '@mui/material';

import { ContactsHeaderActions } from './ContactsHeaderActions';
import { ContactInformationBlock } from './section-blocks/ContactInformationBlock';
import { SocialNetworksBlock } from './section-blocks/SocialNetworksBlock';
import { ContentPageLayout } from '~/(logged_in)/contacts/(shared)/content-page-layout/ContentPageLayout';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';

const ContactsPageContent = () => {
  return (
    <ContentPageLayout
      title={<Typography variant="h4">Контакти</Typography>}
      showBackButton={false}
      rightActions={<ContactsHeaderActions />}
    >
      <CollapsibleBlock title="Контакти" defaultExpanded>
        <Box display="flex" flexDirection="column" gap="24px">
          <ContactInformationBlock />
          <SocialNetworksBlock />
        </Box>
      </CollapsibleBlock>
    </ContentPageLayout>
  );
};

export default ContactsPageContent;
