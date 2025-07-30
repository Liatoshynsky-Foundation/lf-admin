import '../globals.css';
import { Container } from '@mui/material';

import BodyProvider, { metadata as LayoutMetadata } from '~/shared/components/body-provider/BodyProvider';
import { SideBarNavigation } from '~/shared/components/side-navigation/SideNavigation';

export const metadata = LayoutMetadata;

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BodyProvider>
      <SideBarNavigation />
      <Container maxWidth="md" sx={{ border: '1px solid #ccc', padding: '20px' }}>
        {children}
      </Container>
    </BodyProvider>
  );
}
