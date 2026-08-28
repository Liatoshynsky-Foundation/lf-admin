'use client';

import { Box } from '@mui/material';

import { ContactInformationBlock } from './section-blocks/ContactInformationBlock';
import { SocialNetworksBlock } from './section-blocks/SocialNetworksBlock';

export const ContactsSection = () => {
  return (
    <Box display="flex" flexDirection="column" gap="24px">
      <ContactInformationBlock />
      <SocialNetworksBlock />
    </Box>
  );
};
