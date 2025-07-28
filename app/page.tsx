import { Container } from '@mui/material';
import React from 'react';

import AuthWrapper from '~/components/auth-wrapper/AuthWrapper';
import { SideBarNavigation } from '~/components/side-navigation/SideNavigation';

export default function Home() {
  return (
    <AuthWrapper>
      <SideBarNavigation />
      <Container maxWidth="md" sx={{ border: '1px solid #ccc', padding: '20px' }}>
        <h1>Liatoshynsky project</h1>
      </Container>
    </AuthWrapper>
  );
}
