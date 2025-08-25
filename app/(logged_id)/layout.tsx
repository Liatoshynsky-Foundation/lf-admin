import '../globals.css';
import { Container } from '@mui/material';

import BodyProvider, { metadata as LayoutMetadata } from '~/providers/body-provider/BodyProvider';
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
      <Container sx={{ padding: '20px', maxWidth: '1098px' }}>{children}</Container>
    </BodyProvider>
  );
}
