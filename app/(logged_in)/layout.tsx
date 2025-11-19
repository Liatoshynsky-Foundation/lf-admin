import '../globals.css';
import { Container } from '@mui/material';

import BodyProvider from '~/providers/body-provider/BodyProvider';
import { SideBarNavigation } from '~/shared/components/side-navigation/SideNavigation';
import DiscardModalProvider from '~/shared/providers/discard-modal-provider/DiscardModalProvider';

export { metadata } from '~/providers/body-provider/BodyProvider';

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BodyProvider>
      <SideBarNavigation />
      <DiscardModalProvider>
        <Container sx={{ padding: '20px', maxWidth: '1098px' }}>{children}</Container>
      </DiscardModalProvider>
    </BodyProvider>
  );
}
